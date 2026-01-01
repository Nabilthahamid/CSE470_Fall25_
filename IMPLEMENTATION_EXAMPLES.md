# Free AI Implementation Examples

## 1. Enhanced Sales Predictions (Statistical Method)

```typescript
// File: src/lib/services/AIService.ts

/**
 * Enhanced sales prediction using statistical methods
 */
async predictSalesEnhanced(): Promise<SalesPrediction> {
  const sales = await saleService.getAllSales();
  
  // Get last 90 days of sales
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const recentSales = sales.filter(sale => 
    new Date(sale.created_at) >= ninetyDaysAgo
  );
  
  // Calculate daily sales
  const dailySales: { [date: string]: number } = {};
  recentSales.forEach(sale => {
    const date = sale.created_at.split('T')[0];
    dailySales[date] = (dailySales[date] || 0) + sale.quantity;
  });
  
  const salesArray = Object.values(dailySales);
  
  // Calculate moving averages
  const ma7 = this.calculateMovingAverage(salesArray, 7);
  const ma14 = this.calculateMovingAverage(salesArray, 14);
  const ma30 = this.calculateMovingAverage(salesArray, 30);
  
  // Predict next 30 days
  const avgDailySales = salesArray.slice(-30).reduce((a, b) => a + b, 0) / 30;
  const trend = this.detectTrend(salesArray.slice(-14));
  
  // Apply trend multiplier
  let trendMultiplier = 1;
  if (trend === 'increasing') trendMultiplier = 1.1;
  if (trend === 'decreasing') trendMultiplier = 0.9;
  
  const predictedDailySales = avgDailySales * trendMultiplier;
  const predictedSales = Math.round(predictedDailySales * 30);
  const avgPrice = recentSales.reduce((sum, s) => sum + s.total_price, 0) / recentSales.length;
  const predictedRevenue = predictedSales * avgPrice;
  
  // Calculate confidence (based on data consistency)
  const variance = this.calculateVariance(salesArray.slice(-30));
  const confidence = Math.max(0, Math.min(1, 1 - (variance / avgDailySales)));
  
  return {
    predictedSales,
    predictedRevenue,
    trend,
    confidence: Math.round(confidence * 100) / 100,
    factors: [
      `Average daily sales: ${avgDailySales.toFixed(1)} units`,
      `Trend: ${trend}`,
      `Based on last 90 days of data`
    ]
  };
}

private calculateMovingAverage(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

private detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}

private calculateVariance(data: number[]): number {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
}
```

---

## 2. Advanced Stock Recommendations (EOQ & Reorder Points)

```typescript
// File: src/lib/services/AIService.ts

/**
 * Enhanced stock recommendations with EOQ and reorder points
 */
async getStockRecommendationsEnhanced(): Promise<StockRecommendation[]> {
  const products = await productService.getAllProducts();
  const sales = await saleService.getAllSales();
  
  const recommendations: StockRecommendation[] = [];
  
  for (const product of products) {
    // Calculate sales velocity (units sold per day)
    const productSales = sales.filter(s => 
      s.items?.some(item => item.product_id === product.id)
    );
    
    if (productSales.length === 0) continue;
    
    const firstSale = new Date(productSales[productSales.length - 1].created_at);
    const lastSale = new Date(productSales[0].created_at);
    const days = Math.max(1, (lastSale.getTime() - firstSale.getTime()) / (1000 * 60 * 60 * 24));
    
    const totalSold = productSales.reduce((sum, sale) => {
      const item = sale.items?.find(i => i.product_id === product.id);
      return sum + (item?.quantity || 0);
    }, 0);
    
    const dailySalesVelocity = totalSold / days;
    
    // Estimate lead time (assume 7 days if not available)
    const leadTimeDays = 7;
    
    // Calculate safety stock (buffer for uncertainty)
    // Safety stock = (max daily sales - avg daily sales) × lead time
    const maxDailySales = Math.max(...productSales.map(s => {
      const item = s.items?.find(i => i.product_id === product.id);
      return item?.quantity || 0;
    }));
    const safetyStock = Math.ceil((maxDailySales - dailySalesVelocity) * leadTimeDays);
    
    // Calculate reorder point
    // Reorder point = (daily sales × lead time) + safety stock
    const reorderPoint = Math.ceil(dailySalesVelocity * leadTimeDays + safetyStock);
    
    // Calculate Economic Order Quantity (EOQ)
    // EOQ = sqrt((2 × annual demand × ordering cost) / holding cost)
    const annualDemand = dailySalesVelocity * 365;
    const orderingCost = 100; // Assume Tk 100 per order
    const holdingCost = product.price * 0.2; // 20% of product price
    const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
    
    // Calculate days until stockout
    const daysUntilStockout = product.stock / dailySalesVelocity;
    
    // Determine urgency
    let urgency: 'high' | 'medium' | 'low' = 'low';
    if (product.stock <= reorderPoint) urgency = 'high';
    else if (product.stock <= reorderPoint * 1.5) urgency = 'medium';
    
    // Calculate priority score (0-1)
    const priorityScore = Math.min(1, 
      (urgency === 'high' ? 0.5 : urgency === 'medium' ? 0.3 : 0.1) +
      (daysUntilStockout < 7 ? 0.3 : daysUntilStockout < 14 ? 0.2 : 0.1) +
      (product.price > 10000 ? 0.2 : 0.1)
    );
    
    if (product.stock <= reorderPoint * 2) {
      recommendations.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        recommendedOrder: eoq,
        urgency,
        reason: `Sales velocity: ${dailySalesVelocity.toFixed(1)} units/day. Reorder point: ${reorderPoint}. Estimated stockout in ${Math.ceil(daysUntilStockout)} days.`,
        estimatedStockoutDate: new Date(Date.now() + daysUntilStockout * 24 * 60 * 60 * 1000).toISOString(),
        priorityScore: Math.round(priorityScore * 100) / 100
      });
    }
  }
  
  // Sort by priority score
  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
}
```

---

## 3. Customer RFM Segmentation

```typescript
// File: src/lib/services/AIService.ts

interface RFMSegment {
  userId: string;
  recency: number; // Days since last order
  frequency: number; // Number of orders
  monetary: number; // Total spent
  segment: 'champion' | 'loyal' | 'at_risk' | 'new' | 'lost';
  score: number; // 0-1 scale
}

/**
 * Perform RFM analysis on customers
 */
async performRFMAnalysis(): Promise<RFMSegment[]> {
  const users = await userService.getAllUsers();
  const orders = await orderService.getAllOrders();
  
  const now = new Date();
  const segments: RFMSegment[] = [];
  
  for (const user of users) {
    const userOrders = orders.filter(o => o.user_id === user.id);
    
    if (userOrders.length === 0) {
      segments.push({
        userId: user.id,
        recency: 999,
        frequency: 0,
        monetary: 0,
        segment: 'lost',
        score: 0
      });
      continue;
    }
    
    // Recency: Days since last order
    const lastOrder = new Date(userOrders[0].created_at);
    const recency = Math.floor((now.getTime() - lastOrder.getTime()) / (1000 * 60 * 60 * 24));
    
    // Frequency: Number of orders
    const frequency = userOrders.length;
    
    // Monetary: Total spent
    const monetary = userOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Determine segment
    let segment: RFMSegment['segment'];
    let score = 0;
    
    if (recency <= 30 && frequency >= 5 && monetary > 50000) {
      segment = 'champion';
      score = 0.9;
    } else if (recency <= 60 && frequency >= 3 && monetary > 20000) {
      segment = 'loyal';
      score = 0.7;
    } else if (recency <= 30 && frequency <= 2) {
      segment = 'new';
      score = 0.5;
    } else if (recency > 90 && frequency >= 2) {
      segment = 'at_risk';
      score = 0.3;
    } else {
      segment = 'lost';
      score = 0.1;
    }
    
    segments.push({
      userId: user.id,
      recency,
      frequency,
      monetary,
      segment,
      score
    });
  }
  
  return segments;
}
```

---

## 4. Order Risk Scoring

```typescript
// File: src/lib/services/AIService.ts

interface OrderRiskScore {
  orderId: string;
  riskScore: number; // 0-1 scale
  riskLevel: 'high' | 'medium' | 'low';
  factors: string[];
  recommendations: string[];
}

/**
 * Calculate risk score for an order
 */
async scoreOrderRisk(order: Order): Promise<OrderRiskScore> {
  const factors: string[] = [];
  let riskScore = 0;
  
  // Factor 1: High value order
  if (order.total_amount > 50000) {
    riskScore += 0.2;
    factors.push('High value order (>Tk 50,000)');
  }
  
  // Factor 2: New customer
  const userOrders = await orderService.getAllOrders({ userId: order.user_id });
  if (userOrders.length === 1) {
    riskScore += 0.3;
    factors.push('New customer (first order)');
  }
  
  // Factor 3: Unusual shipping address
  // Check if address matches common patterns (simple heuristic)
  const address = order.customer_address?.toLowerCase() || '';
  if (address.includes('po box') || address.length < 10) {
    riskScore += 0.2;
    factors.push('Unusual shipping address');
  }
  
  // Factor 4: Payment method
  if (order.payment_method === 'cash_on_delivery' && order.total_amount > 30000) {
    riskScore += 0.15;
    factors.push('High-value COD order');
  }
  
  // Factor 5: Multiple items (potential fraud)
  if (order.items && order.items.length > 10) {
    riskScore += 0.1;
    factors.push('Unusually large number of items');
  }
  
  // Factor 6: Rapid orders (potential fraud)
  const recentOrders = userOrders.filter(o => {
    const orderDate = new Date(o.created_at);
    const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  if (recentOrders.length > 3) {
    riskScore += 0.15;
    factors.push('Multiple orders in short time');
  }
  
  // Determine risk level
  let riskLevel: 'high' | 'medium' | 'low';
  if (riskScore >= 0.6) riskLevel = 'high';
  else if (riskScore >= 0.3) riskLevel = 'medium';
  else riskLevel = 'low';
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (riskLevel === 'high') {
    recommendations.push('Verify customer identity');
    recommendations.push('Consider requiring additional payment verification');
  } else if (riskLevel === 'medium') {
    recommendations.push('Monitor order closely');
    recommendations.push('Confirm shipping address');
  } else {
    recommendations.push('Standard processing');
  }
  
  return {
    orderId: order.id,
    riskScore: Math.round(riskScore * 100) / 100,
    riskLevel,
    factors,
    recommendations
  };
}
```

---

## 5. Hugging Face Sentiment Analysis Integration

```typescript
// File: src/lib/services/AIService.ts

/**
 * Enhanced sentiment analysis using Hugging Face
 */
async analyzeReviewSentimentHF(review: { rating: number; comment: string }): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions?: string[];
}> {
  const HF_API_KEY = env.HUGGINGFACE_API_KEY; // Optional, can use without key for some models
  
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
      {
        headers: {
          ...(HF_API_KEY && { Authorization: `Bearer ${HF_API_KEY}` }),
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ inputs: review.comment })
      }
    );
    
    if (!response.ok) {
      throw new Error('Hugging Face API error');
    }
    
    const data = await response.json();
    
    // Parse response (format: [{label: 'POSITIVE', score: 0.95}, ...])
    const sentiments = Array.isArray(data[0]) ? data[0] : data;
    const topSentiment = sentiments.sort((a: any, b: any) => b.score - a.score)[0];
    
    // Map labels to our format
    const labelMap: { [key: string]: 'positive' | 'negative' | 'neutral' } = {
      'POSITIVE': 'positive',
      'NEGATIVE': 'negative',
      'NEUTRAL': 'neutral',
      'LABEL_0': 'negative',
      'LABEL_1': 'neutral',
      'LABEL_2': 'positive'
    };
    
    return {
      sentiment: labelMap[topSentiment.label] || 'neutral',
      confidence: topSentiment.score
    };
  } catch (error) {
    console.error('Hugging Face API error, using fallback:', error);
    // Fallback to rule-based
    return this.analyzeReviewSentiment(review);
  }
}
```

---

## 6. Product Similarity Detection

```typescript
// File: src/lib/services/AIService.ts

/**
 * Find similar products using text similarity
 */
async findSimilarProducts(productId: string, threshold: number = 0.7): Promise<Array<{
  product: Product;
  similarity: number;
}>> {
  const targetProduct = await productService.getProductById(productId);
  const allProducts = await productService.getAllProducts();
  
  const targetText = `${targetProduct.name} ${targetProduct.description} ${targetProduct.brand || ''} ${targetProduct.specifications || ''}`.toLowerCase();
  const targetWords = new Set(targetText.split(/\s+/).filter(w => w.length > 2));
  
  const similarities: Array<{ product: Product; similarity: number }> = [];
  
  for (const product of allProducts) {
    if (product.id === productId) continue;
    
    const productText = `${product.name} ${product.description} ${product.brand || ''} ${product.specifications || ''}`.toLowerCase();
    const productWords = new Set(productText.split(/\s+/).filter(w => w.length > 2));
    
    // Calculate Jaccard similarity
    const intersection = new Set([...targetWords].filter(x => productWords.has(x)));
    const union = new Set([...targetWords, ...productWords]);
    const similarity = intersection.size / union.size;
    
    // Also check price similarity (within 20%)
    const priceSimilarity = 1 - Math.abs(targetProduct.price - product.price) / Math.max(targetProduct.price, product.price);
    const combinedSimilarity = (similarity * 0.7) + (priceSimilarity * 0.3);
    
    if (combinedSimilarity >= threshold) {
      similarities.push({
        product,
        similarity: Math.round(combinedSimilarity * 100) / 100
      });
    }
  }
  
  return similarities.sort((a, b) => b.similarity - a.similarity);
}
```

---

## Usage in Admin Pages

### Example: Add Risk Score to Orders Page

```typescript
// File: src/routes/admin/orders/+page.server.ts

export const load: PageServerLoad = async ({ locals, url }) => {
  // ... existing code ...
  
  // Add risk scores to orders
  const ordersWithRisk = await Promise.all(
    orders.map(async (order) => {
      const riskScore = await aiService.scoreOrderRisk(order);
      return {
        ...order,
        riskScore
      };
    })
  );
  
  return {
    orders: ordersWithRisk,
    // ... rest of return
  };
};
```

```svelte
<!-- File: src/routes/admin/orders/+page.svelte -->
<!-- In the orders table -->
<td class="px-6 py-4">
  <span class="px-3 py-1 rounded-full text-xs font-semibold {order.riskScore.riskLevel === 'high' ? 'bg-red-100 text-red-800' : order.riskScore.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
    {order.riskScore.riskLevel.toUpperCase()} ({order.riskScore.riskScore})
  </span>
</td>
```

---

These examples show how to implement free AI features using statistical methods and simple algorithms. All of these can be implemented without any external API costs.

