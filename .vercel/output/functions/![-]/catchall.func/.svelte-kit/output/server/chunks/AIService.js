import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { b as private_env } from "./shared-server.js";
import { productService } from "./ProductService.js";
import { s as saleService } from "./SaleService.js";
class EnhancedAIService {
  /**
   * Calculate simple moving average
   */
  calculateSimpleMovingAverage(data, period) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }
  /**
   * Calculate weighted moving average
   */
  calculateWeightedMovingAverage(data, period) {
    const result = [];
    const weights = Array.from({ length: period }, (_, i) => i + 1);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const weightedSum = slice.reduce((sum, value, idx) => sum + value * weights[idx], 0);
        result.push(weightedSum / weightSum);
      }
    }
    return result;
  }
  /**
   * Calculate exponential moving average
   */
  calculateExponentialMovingAverage(data, alpha) {
    if (data.length === 0) return [];
    const result = [data[0]];
    for (let i = 1; i < data.length; i++) {
      const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }
    return result;
  }
  /**
   * Detect trend in data
   */
  detectTrend(data) {
    if (data.length < 2) return "stable";
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    if (slope > 0.1) return "increasing";
    if (slope < -0.1) return "decreasing";
    return "stable";
  }
  /**
   * Calculate Z-score for anomaly detection
   */
  calculateZScore(value, mean, stdDev) {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }
  /**
   * Calculate reorder point: (daily sales × lead time) + safety stock
   */
  calculateReorderPoint(salesVelocity, leadTime, safetyStock) {
    return Math.ceil(salesVelocity * leadTime + safetyStock);
  }
  /**
   * Calculate Economic Order Quantity (EOQ)
   * EOQ = sqrt((2 × D × S) / H)
   * D = annual demand, S = ordering cost, H = holding cost per unit
   */
  calculateEOQ(demand, orderingCost, holdingCost) {
    if (holdingCost === 0) return demand;
    const eoq = Math.sqrt(2 * demand * orderingCost / holdingCost);
    return Math.ceil(eoq);
  }
  /**
   * Calculate safety stock based on demand variability and lead time
   */
  calculateSafetyStock(averageDemand, demandStdDev, leadTime, serviceLevel = 0.95) {
    const zScore = serviceLevel === 0.95 ? 1.65 : serviceLevel === 0.99 ? 2.33 : 1.28;
    const safetyStock = zScore * demandStdDev * Math.sqrt(leadTime);
    return Math.ceil(Math.max(safetyStock, averageDemand * 0.1));
  }
  /**
   * Perform RFM Analysis (Recency, Frequency, Monetary)
   */
  performRFMAnalysis(customers) {
    const segments = [];
    const now = Date.now();
    for (const customer of customers) {
      const recency = customer.lastOrderDate ? Math.floor((now - new Date(customer.lastOrderDate).getTime()) / (1e3 * 60 * 60 * 24)) : 999;
      let recencyScore = 5;
      if (recency <= 30) recencyScore = 5;
      else if (recency <= 60) recencyScore = 4;
      else if (recency <= 90) recencyScore = 3;
      else if (recency <= 180) recencyScore = 2;
      else recencyScore = 1;
      const frequencyScore = Math.min(5, Math.max(1, Math.ceil(customer.orderCount / 2)));
      const avgOrderValue = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;
      let monetaryScore = 1;
      if (avgOrderValue >= 1e4) monetaryScore = 5;
      else if (avgOrderValue >= 5e3) monetaryScore = 4;
      else if (avgOrderValue >= 2e3) monetaryScore = 3;
      else if (avgOrderValue >= 1e3) monetaryScore = 2;
      let segment = "New";
      if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
        segment = "Champion";
      } else if (recencyScore >= 3 && frequencyScore >= 3) {
        segment = "Loyal";
      } else if (recencyScore <= 2 && frequencyScore >= 2) {
        segment = "At Risk";
      } else if (recency <= 30 && customer.orderCount === 1) {
        segment = "New";
      } else if (recency > 180) {
        segment = "Lost";
      }
      const score = (recencyScore + frequencyScore + monetaryScore) / 15;
      segments.push({
        userId: customer.userId,
        userName: customer.userName,
        recency,
        frequency: customer.orderCount,
        monetary: customer.totalSpent,
        segment,
        score
      });
    }
    return segments;
  }
  /**
   * Calculate Customer Lifetime Value (CLV)
   * CLV = Average Order Value × Purchase Frequency × Customer Lifespan
   */
  calculateCLV(avgOrderValue, purchaseFrequency, customerLifespan) {
    return avgOrderValue * purchaseFrequency * customerLifespan;
  }
  /**
   * Detect anomalies in sales data using statistical methods
   */
  detectAnomalies(salesData) {
    if (salesData.length < 7) return [];
    const salesByDate = salesData.reduce(
      (acc, sale) => {
        if (!sale.created_at) return acc;
        const date = new Date(sale.created_at).toDateString();
        if (!acc[date]) acc[date] = { revenue: 0, count: 0 };
        acc[date].revenue += sale.total_amount;
        acc[date].count += sale.quantity;
        return acc;
      },
      {}
    );
    const dates = Object.keys(salesByDate).sort();
    const revenues = dates.map((date) => salesByDate[date].revenue);
    const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const movingAvg = this.calculateSimpleMovingAverage(revenues, 7).filter((v) => !isNaN(v));
    movingAvg.reduce((a, b) => a + b, 0) / movingAvg.length;
    const anomalies = [];
    dates.forEach((date, index) => {
      const revenue = revenues[index];
      const zScore = this.calculateZScore(revenue, mean, stdDev);
      if (zScore > 2) {
        anomalies.push({
          date,
          type: "spike",
          severity: zScore > 3 ? "high" : "medium",
          explanation: `Sales increased ${((revenue / mean - 1) * 100).toFixed(1)}% compared to average`,
          recommendedAction: "Investigate marketing campaign impact or external factors",
          value: revenue,
          deviation: (revenue / mean - 1) * 100
        });
      } else if (zScore < -2 && revenue > 0) {
        anomalies.push({
          date,
          type: "drop",
          severity: zScore < -3 ? "high" : "medium",
          explanation: `Sales decreased ${((1 - revenue / mean) * 100).toFixed(1)}% compared to average`,
          recommendedAction: "Review inventory availability and marketing strategies",
          value: revenue,
          deviation: (1 - revenue / mean) * 100
        });
      } else if (index >= 6) {
        const maIndex = index - 6;
        if (maIndex < movingAvg.length && movingAvg[maIndex] > 0) {
          const deviation = Math.abs((revenue - movingAvg[maIndex]) / movingAvg[maIndex]);
          if (deviation > 0.5 && deviation < 2) {
            anomalies.push({
              date,
              type: "unusual_pattern",
              severity: deviation > 0.75 ? "medium" : "low",
              explanation: `Sales deviated ${(deviation * 100).toFixed(1)}% from 7-day moving average`,
              recommendedAction: "Monitor for patterns or seasonal effects",
              value: revenue,
              deviation: deviation * 100
            });
          }
        }
      }
    });
    return anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
  }
  /**
   * Find similar products based on name, description, price, and specs
   */
  findSimilarProducts(product, allProducts) {
    const similar = [];
    for (const other of allProducts) {
      if (other.id === product.id) continue;
      let score = 0;
      let maxScore = 0;
      const nameSimilarity = this.calculateStringSimilarity(
        product.name.toLowerCase(),
        other.name.toLowerCase()
      );
      score += nameSimilarity * 0.4;
      maxScore += 0.4;
      if (product.description && other.description) {
        const descSimilarity = this.calculateStringSimilarity(
          product.description.toLowerCase(),
          other.description.toLowerCase()
        );
        score += descSimilarity * 0.3;
        maxScore += 0.3;
      }
      const priceDiff = Math.abs(product.price - other.price) / Math.max(product.price, other.price);
      const priceSimilarity = Math.max(0, 1 - priceDiff * 5);
      score += priceSimilarity * 0.2;
      maxScore += 0.2;
      if (product.brand && other.brand && product.brand === other.brand) {
        score += 0.1;
        maxScore += 0.1;
      }
      const finalScore = maxScore > 0 ? score / maxScore : 0;
      if (finalScore > 0.5) {
        similar.push({ product: other, similarityScore: finalScore });
      }
    }
    return similar.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
  }
  /**
   * Calculate string similarity using Jaccard similarity (word-based)
   */
  calculateStringSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/).filter((w) => w.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter((w) => w.length > 2));
    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = /* @__PURE__ */ new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  /**
   * Suggest product category based on name and description
   */
  suggestCategory(product) {
    const text = `${product.name} ${product.description || ""}`.toLowerCase();
    const suggestions = [];
    const categoryKeywords = {
      CPU: ["cpu", "processor", "intel", "amd", "ryzen", "core i"],
      GPU: ["gpu", "graphics", "video card", "rtx", "gtx", "radeon"],
      RAM: ["ram", "memory", "ddr"],
      Storage: ["ssd", "hdd", "hard drive", "storage", "nvme"],
      Motherboard: ["motherboard", "mobo", "mainboard"],
      PSU: ["psu", "power supply"],
      Case: ["case", "chassis", "tower"],
      Cooling: ["cooler", "fan", "cooling", "heatsink"],
      Monitor: ["monitor", "display", "screen"],
      Keyboard: ["keyboard"],
      Mouse: ["mouse"],
      Headphone: ["headphone", "headset", "earphone"],
      Speaker: ["speaker"],
      Laptop: ["laptop", "notebook"]
    };
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter((keyword) => text.includes(keyword)).length;
      if (matches > 0) {
        suggestions.push({
          category,
          score: matches / keywords.length
        });
      }
    }
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
  }
}
const enhancedAIService = new EnhancedAIService();
class AIService {
  /**
   * Analyze products and provide AI insights for comparison
   * This uses a rule-based approach that can be enhanced with OpenAI API later
   */
  async analyzeComparison(products) {
    if (products.length === 0) {
      throw new Error("No products to analyze");
    }
    if (products.length === 1) {
      return {
        bestValue: {
          productId: products[0].id,
          reason: "Only one product in comparison"
        },
        summary: "Add more products to compare and get AI insights.",
        recommendation: "Consider adding similar products to compare features, prices, and value."
      };
    }
    const bestValue = this.findBestValue(products);
    const bestForGaming = this.findBestForGaming(products);
    const bestForWork = this.findBestForWork(products);
    const bestPerformance = this.findBestPerformance(products);
    const summary = this.generateSummary(products, bestValue, bestForGaming, bestForWork);
    const recommendation = this.generateRecommendation(products);
    return {
      bestValue,
      bestForGaming,
      bestForWork,
      bestPerformance,
      summary,
      recommendation
    };
  }
  /**
   * Find best value product (best price/performance ratio)
   */
  findBestValue(products) {
    const scored = products.map((product) => {
      const priceScore = 1e3 / (product.price || 1);
      const specScore = this.extractSpecScore(product);
      const valueScore = specScore * 0.7 + priceScore * 0.3;
      return {
        productId: product.id,
        product,
        valueScore
      };
    });
    const best = scored.reduce(
      (prev, current) => current.valueScore > prev.valueScore ? current : prev
    );
    const price = best.product.price.toFixed(2);
    return {
      productId: best.productId,
      reason: `Best value for money at Tk ${price}. Offers excellent features at a competitive price point.`
    };
  }
  /**
   * Find best product for gaming
   */
  findBestForGaming(products) {
    const gamingKeywords = ["gaming", "gpu", "graphics", "rgb", "performance", "fps", "rtx", "gtx"];
    const scored = products.map((product) => {
      const text = `${product.name} ${product.description} ${product.specifications || ""}`.toLowerCase();
      const gamingScore = gamingKeywords.reduce((score, keyword) => {
        return score + (text.includes(keyword) ? 1 : 0);
      }, 0);
      const isGPU = text.includes("graphics") || text.includes("gpu") || text.includes("video card");
      const hasHighPerf = text.includes("high performance") || text.includes("powerful");
      return {
        productId: product.id,
        product,
        gamingScore: gamingScore + (isGPU ? 3 : 0) + (hasHighPerf ? 2 : 0)
      };
    });
    const best = scored.reduce(
      (prev, current) => current.gamingScore > prev.gamingScore ? current : prev
    );
    if (best.gamingScore === 0) {
      return void 0;
    }
    return {
      productId: best.productId,
      reason: `Best for gaming with gaming-optimized features and performance specifications.`
    };
  }
  /**
   * Find best product for work/productivity
   */
  findBestForWork(products) {
    const workKeywords = [
      "office",
      "productivity",
      "business",
      "professional",
      "workstation",
      "efficient",
      "reliable"
    ];
    const scored = products.map((product) => {
      const text = `${product.name} ${product.description} ${product.specifications || ""}`.toLowerCase();
      const workScore = workKeywords.reduce((score, keyword) => {
        return score + (text.includes(keyword) ? 1 : 0);
      }, 0);
      const isReliable = text.includes("reliable") || text.includes("durable") || text.includes("quality");
      const isEfficient = text.includes("efficient") || text.includes("energy") || text.includes("low power");
      return {
        productId: product.id,
        product,
        workScore: workScore + (isReliable ? 2 : 0) + (isEfficient ? 1 : 0)
      };
    });
    const best = scored.reduce(
      (prev, current) => current.workScore > prev.workScore ? current : prev
    );
    if (best.workScore === 0) {
      return void 0;
    }
    return {
      productId: best.productId,
      reason: `Best for work and productivity with reliable performance and professional features.`
    };
  }
  /**
   * Find best performance product
   */
  findBestPerformance(products) {
    const performanceKeywords = [
      "high performance",
      "powerful",
      "fast",
      "speed",
      "premium",
      "flagship"
    ];
    const scored = products.map((product) => {
      const text = `${product.name} ${product.description} ${product.specifications || ""}`.toLowerCase();
      const perfScore = performanceKeywords.reduce((score, keyword) => {
        return score + (text.includes(keyword) ? 1 : 0);
      }, 0);
      const priceScore = product.price / 1e4;
      const specScore = this.extractSpecScore(product);
      return {
        productId: product.id,
        product,
        performanceScore: perfScore * 2 + specScore * 0.5 + priceScore * 0.3
      };
    });
    const best = scored.reduce(
      (prev, current) => current.performanceScore > prev.performanceScore ? current : prev
    );
    return {
      productId: best.productId,
      reason: `Best overall performance with high-end specifications and premium features.`
    };
  }
  /**
   * Extract a score from product specifications
   */
  extractSpecScore(product) {
    const text = `${product.specifications || ""} ${product.description || ""}`.toLowerCase();
    let score = 0;
    if (text.includes("i9") || text.includes("ryzen 9")) score += 10;
    else if (text.includes("i7") || text.includes("ryzen 7")) score += 7;
    else if (text.includes("i5") || text.includes("ryzen 5")) score += 5;
    else if (text.includes("i3") || text.includes("ryzen 3")) score += 3;
    const ramMatch = text.match(/(\d+)\s*gb\s*(?:ram|memory)/i);
    if (ramMatch) {
      const ramGB = parseInt(ramMatch[1]);
      score += Math.min(ramGB / 4, 5);
    }
    if (text.includes("ssd") || text.includes("nvme")) score += 3;
    if (text.includes("1tb") || text.includes("2tb")) score += 2;
    if (text.includes("rtx 40") || text.includes("rtx 30")) score += 8;
    else if (text.includes("rtx") || text.includes("gtx")) score += 5;
    return score;
  }
  /**
   * Generate summary of comparison
   */
  generateSummary(products, bestValue, bestForGaming, bestForWork) {
    const bestValueProduct = products.find((p) => p.id === bestValue.productId);
    const insights = [];
    if (bestValueProduct) {
      insights.push(
        `Best Value: ${bestValueProduct.name} offers the best price-to-performance ratio.`
      );
    }
    if (bestForGaming) {
      const gamingProduct = products.find((p) => p.id === bestForGaming.productId);
      if (gamingProduct) {
        insights.push(
          `Best for Gaming: ${gamingProduct.name} is optimized for gaming performance.`
        );
      }
    }
    if (bestForWork) {
      const workProduct = products.find((p) => p.id === bestForWork.productId);
      if (workProduct) {
        insights.push(
          `Best for Work: ${workProduct.name} excels in productivity and professional tasks.`
        );
      }
    }
    return insights.join(" ") || `Comparing ${products.length} products. Each has unique strengths based on your needs.`;
  }
  /**
   * Generate recommendation
   */
  generateRecommendation(products) {
    const priceRange = {
      min: Math.min(...products.map((p) => p.price)),
      max: Math.max(...products.map((p) => p.price))
    };
    const priceDiff = (priceRange.max - priceRange.min) / priceRange.min * 100;
    if (priceDiff > 50) {
      return `There's a significant price difference (${priceDiff.toFixed(0)}%) between these products. Consider your budget and specific needs. The best value option provides excellent features at a competitive price.`;
    } else if (priceDiff > 20) {
      return `These products are in a similar price range. Choose based on your specific use case - gaming, work, or general use.`;
    } else {
      return `These products are similarly priced. The choice depends on your specific requirements and preferences.`;
    }
  }
  /**
   * Enhanced AI analysis using OpenAI (optional - requires API key)
   * This uses OpenAI GPT for more sophisticated analysis
   */
  async analyzeComparisonWithAI(products) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return this.analyzeComparison(products);
    }
    try {
      const openai = new OpenAI({
        apiKey: openaiApiKey
      });
      const productData = products.map((p) => ({
        name: p.name,
        price: p.price,
        description: p.description,
        brand: p.brand,
        specifications: p.specifications,
        stock: p.stock
      }));
      const prompt = `You are an expert tech product analyst. Analyze these ${products.length} products and provide detailed comparison insights.

Products to compare:
${productData.map(
        (p, i) => `
Product ${i + 1}:
- Name: ${p.name}
- Price: ${p.price} Taka (Bangladeshi currency)
- Brand: ${p.brand || "Not specified"}
- Description: ${p.description}
- Specifications: ${p.specifications || "Not provided"}
- Stock: ${p.stock} units
`
      ).join("\n")}

Please provide a JSON response with the following structure:
{
  "bestValue": {
    "productIndex": 0,
    "reason": "Detailed reason why this is the best value"
  },
  "bestForGaming": {
    "productIndex": 0,
    "reason": "Detailed reason why this is best for gaming"
  },
  "bestForWork": {
    "productIndex": 0,
    "reason": "Detailed reason why this is best for work/productivity"
  },
  "bestPerformance": {
    "productIndex": 0,
    "reason": "Detailed reason why this has best performance"
  },
  "summary": "A comprehensive summary comparing all products",
  "recommendation": "A personalized buying recommendation based on different use cases"
}

Important:
- Use productIndex (0-based: 0, 1, 2, etc.) to reference products
- Provide detailed, specific reasons for each recommendation
- Consider price, specifications, brand reputation, and use cases
- Be specific about gaming, work, and performance characteristics
- Return ONLY valid JSON, no additional text`;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        // Using GPT-3.5 for cost efficiency, can upgrade to GPT-4
        messages: [
          {
            role: "system",
            content: "You are an expert tech product analyst specializing in computer hardware and electronics. Provide detailed, accurate, and helpful product comparison insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response from AI");
      }
      let jsonText = aiResponse.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }
      const aiAnalysis = JSON.parse(jsonText);
      const convertToProductId = (index) => {
        if (index >= 0 && index < products.length) {
          return products[index].id;
        }
        return products[0].id;
      };
      const insights = {
        bestValue: {
          productId: convertToProductId(aiAnalysis.bestValue?.productIndex ?? 0),
          reason: aiAnalysis.bestValue?.reason || "Best value based on price and features"
        },
        summary: aiAnalysis.summary || "AI analysis of product comparison",
        recommendation: aiAnalysis.recommendation || "Consider your specific needs and budget when choosing"
      };
      if (aiAnalysis.bestForGaming) {
        insights.bestForGaming = {
          productId: convertToProductId(aiAnalysis.bestForGaming.productIndex),
          reason: aiAnalysis.bestForGaming.reason
        };
      }
      if (aiAnalysis.bestForWork) {
        insights.bestForWork = {
          productId: convertToProductId(aiAnalysis.bestForWork.productIndex),
          reason: aiAnalysis.bestForWork.reason
        };
      }
      if (aiAnalysis.bestPerformance) {
        insights.bestPerformance = {
          productId: convertToProductId(aiAnalysis.bestPerformance.productIndex),
          reason: aiAnalysis.bestPerformance.reason
        };
      }
      return insights;
    } catch (error) {
      console.error("AI analysis failed, using rule-based fallback:", error);
      return this.analyzeComparison(products);
    }
  }
  /**
   * Handle chatbot messages with context-aware responses
   */
  async handleChatMessage(message, userId, conversationHistory = []) {
    const openaiApiKey = private_env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return this.handleChatMessageRuleBased(message, userId);
    }
    try {
      const openai = new OpenAI({
        apiKey: openaiApiKey
      });
      let context = "";
      try {
        context = await this.getChatContext(userId);
      } catch (error) {
        console.warn("Could not build chat context, continuing without it:", error);
      }
      const systemPrompt = `You are a helpful AI assistant for TinyTech, an e-commerce platform specializing in computers, laptops, gaming PCs, and tech products in Bangladesh.

Your role:
- Answer product questions accurately
- Help customers with order status inquiries
- Provide product recommendations based on customer needs
- Be friendly, professional, and concise
- Always provide helpful information about TinyTech products

${context}

Important guidelines:
- If asked about orders, check the order information provided in context
- If asked about products, ALWAYS suggest specific products from the context with their IDs in format: /products/{id}
- When suggesting products, include: product name, price (Tk), and link in format: **Product Name** - Tk {price} | View: /products/{id}
- If customer asks for a product type (e.g., "monitor", "laptop"), search the product list and suggest matching products
- If you don't have specific information, suggest the customer contact support
- Always be helpful and try to guide customers to find what they need
- Prices are in Bangladeshi Taka (Tk)
- Keep responses concise but informative
- Always include clickable product links when suggesting products`;
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-10),
        // Keep last 10 messages for context
        { role: "user", content: message }
      ];
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 500
      });
      const aiResponse = response.choices[0]?.message?.content;
      return aiResponse || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Chatbot error:", error);
      if (error?.status === 429 || error?.code === "insufficient_quota" || error?.code === "rate_limit_exceeded") {
        console.warn("OpenAI API quota exceeded, using rule-based fallback");
        return this.handleChatMessageRuleBased(message, userId);
      }
      return this.handleChatMessageRuleBased(message, userId);
    }
  }
  /**
   * Get context data for chatbot (products, orders, etc.)
   */
  async getChatContext(userId) {
    let context = "";
    try {
      const products = await productService.getAllProducts();
      const recentProducts = products.slice(0, 10).map((p) => ({
        name: p.name,
        price: p.price,
        description: p.description?.substring(0, 100),
        brand: p.brand
      }));
      context += `

Available Products (sample):
${JSON.stringify(recentProducts, null, 2)}
`;
      if (userId) {
        try {
          const sales = await saleService.getAll({ userId });
          if (sales.length > 0) {
            const recentOrders = sales.slice(0, 5).map((s) => ({
              id: s.id,
              product_name: s.product_name || "Unknown",
              quantity: s.quantity,
              total: s.total,
              created_at: s.created_at
            }));
            context += `

User's Recent Orders:
${JSON.stringify(recentOrders, null, 2)}
`;
          }
        } catch (error) {
          console.warn("Could not fetch orders for chat context:", error);
        }
      }
    } catch (error) {
      console.warn("Error building chat context:", error);
    }
    return context;
  }
  /**
   * Rule-based fallback for chatbot when AI is not available
   */
  async handleChatMessageRuleBased(message, userId) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("order") || lowerMessage.includes("status") || lowerMessage.includes("track")) {
      if (userId) {
        try {
          const sales = await saleService.getAll({ userId });
          if (sales.length > 0) {
            const recentOrder = sales[0];
            return `Your most recent order (ID: ${recentOrder.id}) was placed on ${new Date(recentOrder.created_at).toLocaleDateString()}. Total: Tk ${recentOrder.total.toFixed(2)}. For detailed tracking, please check your profile or contact our support team.`;
          }
          return "You don't have any orders yet. Browse our products and make your first purchase!";
        } catch (error) {
          return "I couldn't retrieve your order information. Please contact our support team for assistance.";
        }
      }
      return "Please log in to check your order status. You can view all your orders in your profile.";
    }
    const productKeywords = this.extractProductKeywords(lowerMessage);
    if (productKeywords.length > 0 || this.isProductQuery(lowerMessage)) {
      try {
        let searchResults = [];
        if (productKeywords.length > 0) {
          for (const keyword of productKeywords) {
            const results = await productService.searchProducts(keyword);
            searchResults = [...searchResults, ...results];
          }
          searchResults = searchResults.filter(
            (product, index, self) => index === self.findIndex((p) => p.id === product.id)
          );
        } else {
          searchResults = await productService.searchProducts(message);
        }
        if (searchResults.length > 0) {
          const topProducts = searchResults.slice(0, 5);
          const productList = topProducts.map((p) => {
            const stockStatus = p.stock > 0 ? "✓ In Stock" : "✗ Out of Stock";
            return `• **${p.name}**
  Price: Tk ${p.price.toFixed(2)} | ${stockStatus}
  View: /products/${p.id}`;
          }).join("\n\n");
          return `I found ${searchResults.length} product${searchResults.length > 1 ? "s" : ""} matching your search:

${productList}

Click on any product link above to view details, or browse all products at /products`;
        } else {
          const allProducts = await productService.getAllProducts();
          if (allProducts.length > 0) {
            const similarProducts = allProducts.filter((p) => {
              const productText = `${p.name} ${p.description} ${p.brand || ""}`.toLowerCase();
              return productKeywords.some((keyword) => productText.includes(keyword));
            }).slice(0, 3);
            if (similarProducts.length > 0) {
              const similarList = similarProducts.map((p) => `• **${p.name}** - Tk ${p.price.toFixed(2)} | View: /products/${p.id}`).join("\n");
              return `I couldn't find exact matches, but here are some similar products you might like:

${similarList}

You can also browse all products at /products or search with different keywords.`;
            }
          }
          return `I couldn't find products matching "${message}". Try browsing our products at /products or search with different keywords like "laptop", "monitor", "keyboard", etc.`;
        }
      } catch (error) {
        console.error("Error searching products:", error);
        return "I encountered an error while searching for products. Please try browsing our products page at /products.";
      }
    }
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("best")) {
      try {
        const products = await productService.getAllProducts();
        if (products.length > 0) {
          const inStockProducts = products.filter((p) => p.stock > 0);
          const featured = (inStockProducts.length > 0 ? inStockProducts : products).slice(0, 3);
          const productList = featured.map((p) => `• **${p.name}** - Tk ${p.price.toFixed(2)} | View: /products/${p.id}`).join("\n");
          return `Here are some popular products:

${productList}

Would you like more details about any of these? You can also browse all products on our products page.`;
        }
      } catch (error) {
      }
    }
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! I'm here to help you with product questions, order status, and recommendations. How can I assist you today?";
    }
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      return "I can help you with:\n\n• Product questions and recommendations\n• Order status inquiries\n• General shopping assistance\n\nJust ask me anything!";
    }
    try {
      const searchResults = await productService.searchProducts(message);
      if (searchResults.length > 0) {
        const topProducts = searchResults.slice(0, 3);
        const productList = topProducts.map((p) => `• **${p.name}** - Tk ${p.price.toFixed(2)} | View: /products/${p.id}`).join("\n");
        return `I found some products that might interest you:

${productList}

Would you like to see more? Browse all products at /products`;
      }
    } catch (error) {
    }
    return `I'm here to help with product questions, order status, and recommendations. Try asking about specific products like "monitor", "laptop", or "gaming PC", or browse our products at /products`;
  }
  /**
   * Extract product-related keywords from user message
   */
  extractProductKeywords(message) {
    const productMap = {
      monitor: ["monitor", "moniter", "display", "screen"],
      laptop: ["laptop", "notebook", "computer"],
      desktop: ["desktop", "pc", "computer"],
      keyboard: ["keyboard", "keybord"],
      mouse: ["mouse", "mice"],
      headphone: ["headphone", "headphones", "headset"],
      speaker: ["speaker", "speakers"],
      webcam: ["webcam", "camera"],
      microphone: ["microphone", "mic"],
      printer: ["printer", "print"],
      scanner: ["scanner", "scan"],
      router: ["router", "wifi"],
      ram: ["ram", "memory"],
      storage: ["storage", "ssd", "hard drive", "hdd"],
      graphics: ["graphics", "gpu", "video card"],
      processor: ["processor", "cpu"],
      motherboard: ["motherboard", "mobo"],
      "power supply": ["power supply", "psu"],
      case: ["case", "chassis"],
      cooling: ["cooling", "fan", "cooler"],
      gaming: ["gaming", "game"]
    };
    const keywords = [];
    const lowerMessage = message.toLowerCase();
    for (const [canonical, variants] of Object.entries(productMap)) {
      if (variants.some((variant) => lowerMessage.includes(variant))) {
        keywords.push(canonical);
      }
    }
    const commonWords = [
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "its",
      "may",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "its",
      "let",
      "put",
      "say",
      "she",
      "too",
      "use"
    ];
    const words = lowerMessage.split(/\s+/).filter(
      (word) => word.length >= 3 && !commonWords.includes(word) && !keywords.some((k) => word.includes(k) || k.includes(word))
    );
    words.forEach((word) => {
      if (!keywords.includes(word) && word.length >= 3) {
        keywords.push(word);
      }
    });
    return keywords.slice(0, 5);
  }
  /**
   * Check if message is a product query
   */
  isProductQuery(message) {
    const productIndicators = [
      "need",
      "want",
      "looking for",
      "search",
      "find",
      "show",
      "buy",
      "purchase",
      "product",
      "item",
      "thing",
      "recommend",
      "suggest",
      "best"
    ];
    return productIndicators.some((indicator) => message.includes(indicator));
  }
  /**
   * AI Sales Predictions - Predict sales for next month
   */
  async predictSales(sales) {
    if (sales.length === 0) {
      return {
        predictedSales: 0,
        predictedRevenue: 0,
        confidence: "Low",
        trend: "stable",
        insights: ["Insufficient data for predictions"]
      };
    }
    const salesByDate = sales.reduce(
      (acc, sale) => {
        const date = sale.created_at ? new Date(sale.created_at).toDateString() : "unknown";
        if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
        acc[date].count += sale.quantity;
        acc[date].revenue += sale.total_amount;
        return acc;
      },
      {}
    );
    const dates = Object.keys(salesByDate);
    const avgDailySales = dates.length > 0 ? dates.reduce((sum, date) => sum + salesByDate[date].count, 0) / dates.length : 0;
    const avgDailyRevenue = dates.length > 0 ? dates.reduce((sum, date) => sum + salesByDate[date].revenue, 0) / dates.length : 0;
    const predictedSales = Math.round(avgDailySales * 30);
    const predictedRevenue = avgDailyRevenue * 30;
    const recentSales = sales.slice(-10);
    const olderSales = sales.slice(-20, -10);
    const recentAvg = recentSales.length > 0 ? recentSales.reduce((sum, s) => sum + s.quantity, 0) / recentSales.length : 0;
    const olderAvg = olderSales.length > 0 ? olderSales.reduce((sum, s) => sum + s.quantity, 0) / olderSales.length : 0;
    let trend = "stable";
    if (recentAvg > olderAvg * 1.1) trend = "increasing";
    else if (recentAvg < olderAvg * 0.9) trend = "decreasing";
    const confidence = sales.length > 30 ? "High" : sales.length > 10 ? "Medium" : "Low";
    const insights = [];
    if (trend === "increasing") {
      insights.push("Sales trend is increasing - consider increasing inventory");
    } else if (trend === "decreasing") {
      insights.push("Sales trend is decreasing - review marketing strategies");
    }
    insights.push(`Based on ${sales.length} historical sales records`);
    insights.push(`Average daily sales: ${avgDailySales.toFixed(1)} units`);
    return {
      predictedSales,
      predictedRevenue,
      confidence,
      trend,
      insights
    };
  }
  /**
   * AI Stock Recommendations - Suggest products that need restocking
   */
  async getStockRecommendations(products, sales) {
    const recommendations = [];
    for (const product of products) {
      const productSales = sales.filter((s) => s.product_id === product.id);
      if (productSales.length === 0) continue;
      const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const daysOfData = productSales.length > 0 ? 30 : 1;
      const avgDailySales = totalSold / daysOfData;
      const monthlyDemand = avgDailySales * 30;
      const recommendedStock = Math.ceil(monthlyDemand * 1.5);
      if (product.stock < recommendedStock) {
        const stockRatio = product.stock / recommendedStock;
        let urgency = "low";
        if (stockRatio < 0.3) urgency = "high";
        else if (stockRatio < 0.6) urgency = "medium";
        let reason = "";
        if (product.stock === 0) {
          reason = "Out of stock - immediate restock needed";
        } else if (stockRatio < 0.3) {
          reason = `Very low stock (${product.stock} units). Expected to run out soon based on sales history.`;
        } else {
          reason = `Stock below recommended level. Current: ${product.stock}, Recommended: ${recommendedStock}`;
        }
        recommendations.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          recommendedStock,
          urgency,
          reason
        });
      }
    }
    return recommendations.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }
  /**
   * AI Customer Insights - Analyze customer behavior
   */
  async getCustomerInsights(sales) {
    if (sales.length === 0) {
      return {
        topCustomers: [],
        averageOrderValue: 0,
        customerRetentionRate: "0%",
        insights: ["No sales data available"]
      };
    }
    const customerData = sales.reduce(
      (acc, sale) => {
        const userId = sale.user_id || "guest";
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: sale.user_name || "Guest",
            totalSpent: 0,
            orderCount: 0
          };
        }
        acc[userId].totalSpent += sale.total_amount;
        acc[userId].orderCount += 1;
        return acc;
      },
      {}
    );
    const customers = Object.values(customerData);
    const topCustomers = customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const averageOrderValue = totalRevenue / sales.length;
    const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;
    const customerRetentionRate = customers.length > 0 ? (repeatCustomers / customers.length * 100).toFixed(1) : "0";
    const insights = [];
    insights.push(`Total customers: ${customers.length}`);
    insights.push(`Repeat customers: ${repeatCustomers} (${customerRetentionRate}%)`);
    insights.push(`Average order value: Tk ${averageOrderValue.toFixed(2)}`);
    if (topCustomers.length > 0) {
      insights.push(
        `Top customer: ${topCustomers[0].userName} (Tk ${topCustomers[0].totalSpent.toFixed(2)})`
      );
    }
    return {
      topCustomers,
      averageOrderValue,
      customerRetentionRate: `${customerRetentionRate}%`,
      insights
    };
  }
  /**
   * AI Sales Analytics - Trend analysis and anomaly detection
   */
  async analyzeSales(sales) {
    if (sales.length === 0) {
      return {
        trend: "stable",
        trendStrength: 0,
        anomalies: [],
        insights: ["No sales data available"]
      };
    }
    const salesByDate = sales.reduce(
      (acc, sale) => {
        if (!sale.created_at) return acc;
        const date = new Date(sale.created_at).toDateString();
        if (!acc[date]) acc[date] = { revenue: 0, count: 0 };
        acc[date].revenue += sale.total_amount;
        acc[date].count += sale.quantity;
        return acc;
      },
      {}
    );
    const dates = Object.keys(salesByDate).sort();
    const revenues = dates.map((date) => salesByDate[date].revenue);
    const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
    const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    let trend = "stable";
    const change = (secondAvg - firstAvg) / (firstAvg || 1) * 100;
    if (change > 10) trend = "increasing";
    else if (change < -10) trend = "decreasing";
    const trendStrength = Math.abs(change);
    const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 2 * stdDev;
    const anomalies = [];
    dates.forEach((date, index) => {
      const revenue = revenues[index];
      if (revenue > threshold) {
        anomalies.push({
          date,
          type: "spike",
          value: revenue,
          reason: `Unusual sales spike detected (${((revenue / mean - 1) * 100).toFixed(1)}% above average)`
        });
      } else if (revenue < mean - 2 * stdDev && revenue > 0) {
        anomalies.push({
          date,
          type: "drop",
          value: revenue,
          reason: `Unusual sales drop detected (${((1 - revenue / mean) * 100).toFixed(1)}% below average)`
        });
      }
    });
    const insights = [];
    insights.push(`Sales trend: ${trend} (${trendStrength.toFixed(1)}% change)`);
    if (anomalies.length > 0) {
      insights.push(`Detected ${anomalies.length} anomaly/anomalies in sales patterns`);
    }
    insights.push(`Average daily revenue: Tk ${mean.toFixed(2)}`);
    return {
      trend,
      trendStrength,
      anomalies,
      insights
    };
  }
  /**
   * AI Inventory Predictions - Predict demand and suggest reorder points
   */
  async predictInventory(products, sales) {
    const predictions = [];
    for (const product of products) {
      const productSales = sales.filter((s) => s.product_id === product.id);
      if (productSales.length === 0) {
        predictions.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          predictedDemand: 10,
          // Default
          daysUntilStockout: product.stock > 0 ? 30 : 0,
          reorderPoint: 20,
          suggestedOrderQuantity: 30
        });
        continue;
      }
      const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const daysOfData = Math.max(30, productSales.length);
      const avgDailyDemand = totalSold / daysOfData;
      const monthlyDemand = avgDailyDemand * 30;
      const daysUntilStockout = product.stock > 0 && avgDailyDemand > 0 ? Math.floor(product.stock / avgDailyDemand) : 0;
      const reorderPoint = Math.ceil(monthlyDemand * 1.2);
      const suggestedOrderQuantity = Math.ceil(monthlyDemand * 1.5);
      predictions.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        predictedDemand: Math.ceil(monthlyDemand),
        daysUntilStockout,
        reorderPoint,
        suggestedOrderQuantity
      });
    }
    return predictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }
  /**
   * AI Price Optimization - Suggest optimal prices
   */
  async optimizePrices(products, sales) {
    const optimizations = [];
    for (const product of products) {
      const productSales = sales.filter((s) => s.product_id === product.id);
      const salesCount = productSales.length;
      const salesVelocity = salesCount / 30;
      let suggestedPrice = product.price;
      let reason = "";
      let expectedImpact = "";
      if (product.stock > 50 && salesVelocity < 0.5) {
        suggestedPrice = product.price * 0.9;
        reason = "High inventory and low sales velocity - price reduction may boost demand";
        expectedImpact = "Expected 15-20% increase in sales volume";
      } else if (product.stock < 10 && salesVelocity > 1) {
        suggestedPrice = product.price * 1.1;
        reason = "High demand and low inventory - price increase to maximize revenue";
        expectedImpact = "Expected 5-10% increase in revenue despite lower volume";
      } else if (product.stock === 0) {
        suggestedPrice = product.price;
        reason = "Product is out of stock - maintain price when restocked";
        expectedImpact = "No change recommended";
      } else {
        if (product.price / (product.cost_price || 1) > 2) {
          suggestedPrice = product.price * 0.95;
          reason = "High profit margin allows for competitive pricing";
          expectedImpact = "Expected 5-10% increase in sales";
        } else {
          suggestedPrice = product.price;
          reason = "Price is well-optimized for current market conditions";
          expectedImpact = "No change needed";
        }
      }
      const priceChange = (suggestedPrice - product.price) / product.price * 100;
      if (Math.abs(priceChange) > 1) {
        optimizations.push({
          productId: product.id,
          productName: product.name,
          currentPrice: product.price,
          suggestedPrice: Math.round(suggestedPrice * 100) / 100,
          priceChange: Math.round(priceChange * 10) / 10,
          reason,
          expectedImpact
        });
      }
    }
    return optimizations.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
  }
  /**
   * AI PC Builder Assistant - Suggest components based on requirements
   */
  async suggestPCBuild(requirements, availableProducts, categories) {
    const suggestions = [];
    const requiredCategories = categories.filter((c) => c.is_required);
    const budgetPerCategory = requirements.budget / requiredCategories.length;
    let remainingBudget = requirements.budget;
    for (const category of requiredCategories) {
      const categoryProducts = availableProducts.filter(
        (p) => p.component_category_id === category.id && p.stock > 0
      );
      if (categoryProducts.length === 0) continue;
      const scored = categoryProducts.map((product) => {
        const productText = `${product.name} ${product.description} ${product.specifications || ""}`.toLowerCase();
        let score = 0;
        const budgetFit = 1 - Math.abs(product.price - budgetPerCategory) / requirements.budget;
        score += budgetFit * 0.4;
        if (requirements.useCase === "gaming") {
          if (productText.includes("gaming") || productText.includes("gpu") || productText.includes("graphics")) {
            score += 0.3;
          }
          if (productText.includes("rgb") || productText.includes("performance")) {
            score += 0.2;
          }
        } else if (requirements.useCase === "work" || requirements.useCase === "productivity") {
          if (productText.includes("professional") || productText.includes("business") || productText.includes("office")) {
            score += 0.3;
          }
          if (productText.includes("reliable") || productText.includes("efficient")) {
            score += 0.2;
          }
        } else if (requirements.useCase === "content-creation") {
          if (productText.includes("video") || productText.includes("editing") || productText.includes("rendering")) {
            score += 0.3;
          }
          if (productText.includes("high performance") || productText.includes("workstation")) {
            score += 0.2;
          }
        }
        if (product.price <= remainingBudget) {
          score += 0.1;
        }
        return { product, score };
      });
      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];
      if (best && best.product.price <= remainingBudget) {
        suggestions.push({
          categoryId: category.id,
          categoryName: category.name,
          productId: best.product.id,
          productName: best.product.name,
          price: best.product.price,
          reason: `Best ${category.name.toLowerCase()} for ${requirements.useCase} within budget`
        });
        remainingBudget -= best.product.price;
      } else if (scored.length > 0) {
        const affordable = scored.filter((s) => s.product.price <= remainingBudget);
        if (affordable.length > 0) {
          const cheapest = affordable.sort((a, b) => a.product.price - b.product.price)[0];
          suggestions.push({
            categoryId: category.id,
            categoryName: category.name,
            productId: cheapest.product.id,
            productName: cheapest.product.name,
            price: cheapest.product.price,
            reason: `Affordable ${category.name.toLowerCase()} option`
          });
          remainingBudget -= cheapest.product.price;
        }
      }
    }
    const totalPrice = suggestions.reduce((sum, s) => sum + s.price, 0);
    const explanation = `I've selected ${suggestions.length} components optimized for ${requirements.useCase} within your budget of Tk ${requirements.budget.toFixed(2)}. Total cost: Tk ${totalPrice.toFixed(2)}.`;
    return { suggestions, totalPrice, explanation };
  }
  /**
   * AI Build Optimization - Optimize existing build for better value/performance
   */
  async optimizeBuild(currentBuild, availableProducts, categories, optimizationGoal) {
    const optimizations = [];
    for (const component of currentBuild) {
      const category = categories.find((c) => c.id === component.categoryId);
      if (!category) continue;
      const categoryProducts = availableProducts.filter(
        (p) => p.component_category_id === component.categoryId && p.stock > 0 && p.id !== component.productId
      );
      if (categoryProducts.length === 0) continue;
      const currentProduct = availableProducts.find((p) => p.id === component.productId);
      if (!currentProduct) continue;
      let bestAlternative = null;
      let reason = "";
      if (optimizationGoal === "value") {
        const alternatives = categoryProducts.filter((p) => p.price < currentProduct.price).sort((a, b) => b.price - a.price);
        if (alternatives.length > 0) {
          bestAlternative = alternatives[0];
          reason = `Better value option with similar performance`;
        }
      } else if (optimizationGoal === "performance") {
        const alternatives = categoryProducts.filter((p) => Math.abs(p.price - currentProduct.price) / currentProduct.price < 0.2).sort((a, b) => b.price - a.price);
        if (alternatives.length > 0) {
          bestAlternative = alternatives[0];
          reason = `Better performance at similar price point`;
        }
      } else if (optimizationGoal === "budget") {
        const alternatives = categoryProducts.sort((a, b) => a.price - b.price);
        if (alternatives.length > 0 && alternatives[0].price < currentProduct.price) {
          bestAlternative = alternatives[0];
          reason = `More budget-friendly option`;
        }
      }
      if (bestAlternative) {
        optimizations.push({
          categoryId: component.categoryId,
          categoryName: category.name,
          currentProductId: currentProduct.id,
          currentProductName: currentProduct.name,
          currentPrice: currentProduct.price,
          suggestedProductId: bestAlternative.id,
          suggestedProductName: bestAlternative.name,
          suggestedPrice: bestAlternative.price,
          savings: currentProduct.price - bestAlternative.price,
          reason
        });
      }
    }
    const totalSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0);
    const explanation = `Found ${optimizations.length} optimization${optimizations.length !== 1 ? "s" : ""} that could ${optimizationGoal === "budget" ? "save" : "improve"} your build${totalSavings > 0 ? ` by Tk ${totalSavings.toFixed(2)}` : ""}.`;
    return { optimizations, totalSavings, explanation };
  }
  /**
   * AI Pre-built Configurations - Generate pre-configured builds
   */
  async generatePrebuiltBuilds(useCase, budget, availableProducts, categories) {
    const builds = [];
    const budgetTiers = [
      { name: "Budget", multiplier: 0.7, description: "Affordable build for basic needs" },
      { name: "Mid-Range", multiplier: 1, description: "Balanced performance and price" },
      { name: "High-End", multiplier: 1.5, description: "Premium performance build" }
    ];
    for (const tier of budgetTiers) {
      const tierBudget = budget * tier.multiplier;
      const suggestion = await this.suggestPCBuild(
        { budget: tierBudget, useCase, preferences: tier.name },
        availableProducts,
        categories
      );
      if (suggestion.suggestions.length > 0) {
        builds.push({
          name: `${tier.name} ${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Build`,
          description: `${tier.description} - ${suggestion.explanation}`,
          components: suggestion.suggestions.map((s) => ({
            categoryId: s.categoryId,
            productId: s.productId,
            productName: s.productName,
            price: s.price
          })),
          totalPrice: suggestion.totalPrice
        });
      }
    }
    return builds;
  }
  /**
   * AI Review Sentiment Analysis - Analyze review sentiment and extract features
   */
  async analyzeReviewSentiment(review) {
    const comment = review.comment || "";
    const rating = review.rating;
    const lowerComment = comment.toLowerCase();
    const positiveKeywords = [
      "great",
      "excellent",
      "amazing",
      "love",
      "perfect",
      "good",
      "wonderful",
      "fantastic",
      "awesome",
      "best",
      "recommend",
      "satisfied",
      "happy",
      "pleased"
    ];
    const negativeKeywords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "worst",
      "disappointed",
      "waste",
      "poor",
      "broken",
      "defective",
      "faulty",
      "useless",
      "regret"
    ];
    let positiveScore = 0;
    let negativeScore = 0;
    positiveKeywords.forEach((keyword) => {
      if (lowerComment.includes(keyword)) positiveScore++;
    });
    negativeKeywords.forEach((keyword) => {
      if (lowerComment.includes(keyword)) negativeScore++;
    });
    let sentiment = "neutral";
    let confidence = 0.5;
    if (rating >= 4 && positiveScore > negativeScore) {
      sentiment = "positive";
      confidence = 0.7 + positiveScore * 0.1;
    } else if (rating <= 2 && negativeScore > positiveScore) {
      sentiment = "negative";
      confidence = 0.7 + negativeScore * 0.1;
    } else if (rating === 3 || positiveScore === 0 && negativeScore === 0) {
      sentiment = "neutral";
      confidence = 0.6;
    } else {
      if (rating >= 4) sentiment = "positive";
      else if (rating <= 2) sentiment = "negative";
      confidence = 0.5;
    }
    const featureKeywords = {
      "Battery Life": ["battery", "charge", "power", "endurance", "lasts"],
      Performance: ["fast", "speed", "performance", "quick", "smooth", "responsive"],
      Display: ["screen", "display", "resolution", "quality", "bright", "clear"],
      Design: ["design", "looks", "appearance", "beautiful", "stylish", "build quality"],
      Price: ["price", "value", "affordable", "expensive", "worth", "cost"],
      Processor: ["processor", "cpu", "intel", "amd", "ryzen", "core"],
      Storage: ["storage", "memory", "ram", "ssd", "hard drive", "space"],
      Graphics: ["graphics", "gpu", "video", "gaming", "graphics card"],
      Camera: ["camera", "photo", "picture", "image", "quality"],
      Connectivity: ["wifi", "bluetooth", "usb", "ports", "connection"]
    };
    const keyFeatures = [];
    for (const [feature, keywords] of Object.entries(featureKeywords)) {
      if (keywords.some((keyword) => lowerComment.includes(keyword))) {
        keyFeatures.push(feature);
      }
    }
    let isFakeRisk = false;
    let fakeRiskReason = "";
    if (comment.length < 10 && rating === 5) {
      isFakeRisk = true;
      fakeRiskReason = "Very short review with perfect rating";
    } else if (comment.length > 500 && rating === 5) {
      isFakeRisk = true;
      fakeRiskReason = "Unusually long review with perfect rating";
    } else if (rating === 5 && negativeScore > 0) {
      isFakeRisk = true;
      fakeRiskReason = "Perfect rating but contains negative keywords";
    } else if (rating === 1 && positiveScore > 2) {
      isFakeRisk = true;
      fakeRiskReason = "Low rating but contains many positive keywords";
    }
    confidence = Math.min(confidence, 0.95);
    return {
      sentiment,
      confidence,
      keyFeatures,
      isFakeRisk,
      fakeRiskReason: isFakeRisk ? fakeRiskReason : void 0
    };
  }
  /**
   * AI Review Summary - Generate "What customers love" summary
   */
  async generateReviewSummary(reviews) {
    if (reviews.length === 0) {
      return {
        summary: "No reviews available yet.",
        positiveAspects: [],
        negativeAspects: [],
        averageSentiment: "neutral",
        keyThemes: []
      };
    }
    const sentiments = await Promise.all(
      reviews.map((review) => this.analyzeReviewSentiment(review))
    );
    const sentimentScores = sentiments.map(
      (s) => s.sentiment === "positive" ? 1 : s.sentiment === "negative" ? -1 : 0
    );
    const avgScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
    const averageSentiment = avgScore > 0.2 ? "positive" : avgScore < -0.2 ? "negative" : "neutral";
    const allFeatures = {};
    sentiments.forEach((sentiment, index) => {
      sentiment.keyFeatures.forEach((feature) => {
        if (!allFeatures[feature]) {
          allFeatures[feature] = { count: 0, positive: 0, negative: 0 };
        }
        allFeatures[feature].count++;
        if (sentiment.sentiment === "positive") allFeatures[feature].positive++;
        if (sentiment.sentiment === "negative") allFeatures[feature].negative++;
      });
    });
    const keyThemes = Object.entries(allFeatures).map(([theme, data]) => ({
      theme,
      mentions: data.count,
      sentiment: data.positive > data.negative ? "positive" : data.negative > data.positive ? "negative" : "neutral"
    })).sort((a, b) => b.mentions - a.mentions).slice(0, 5);
    const positiveAspects = [];
    const negativeAspects = [];
    keyThemes.forEach((theme) => {
      if (theme.sentiment === "positive") {
        positiveAspects.push(theme.theme);
      } else if (theme.sentiment === "negative") {
        negativeAspects.push(theme.theme);
      }
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    let summary = `Based on ${reviews.length} review${reviews.length !== 1 ? "s" : ""}, customers ${averageSentiment === "positive" ? "love" : averageSentiment === "negative" ? "have concerns about" : "have mixed feelings about"} this product. `;
    if (positiveAspects.length > 0) {
      summary += `Most praised aspects include: ${positiveAspects.slice(0, 3).join(", ")}. `;
    }
    if (negativeAspects.length > 0) {
      summary += `Areas mentioned for improvement: ${negativeAspects.slice(0, 2).join(", ")}. `;
    }
    summary += `Average rating: ${avgRating.toFixed(1)}/5.`;
    return {
      summary,
      positiveAspects,
      negativeAspects,
      averageSentiment,
      keyThemes
    };
  }
  /**
   * AI Review Moderation - Detect spam/fake/inappropriate content
   */
  async moderateReview(review) {
    const comment = review.comment || "";
    const lowerComment = comment.toLowerCase();
    const flags = [];
    let isSpam = false;
    let isFake = false;
    let isInappropriate = false;
    const spamPatterns = [
      /^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/i,
      // Email addresses
      /https?:\/\/[^\s]+/i,
      // URLs
      /(buy|purchase|cheap|discount|offer|deal)[\s\w]*\d+/i,
      // Promotional content
      /(click|visit|call|contact)[\s\w]*now/i
    ];
    if (spamPatterns.some((pattern) => pattern.test(comment))) {
      isSpam = true;
      flags.push("Contains promotional/spam content");
    }
    const sentiment = await this.analyzeReviewSentiment(review);
    if (sentiment.isFakeRisk) {
      isFake = true;
      flags.push(sentiment.fakeRiskReason || "Suspicious review pattern");
    }
    if (comment.length > 0) {
      const words = comment.split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
        isFake = true;
        flags.push("Highly repetitive content");
      }
    }
    const inappropriateKeywords = ["hate", "stupid", "idiot", "crap", "suck", "trash", "garbage"];
    const hasInappropriate = inappropriateKeywords.some(
      (keyword) => lowerComment.includes(keyword)
    );
    if (hasInappropriate && review.rating <= 2) {
      flags.push("Contains strong negative language");
    } else if (hasInappropriate && review.rating >= 4) {
      isInappropriate = true;
      flags.push("Inappropriate language with high rating");
    }
    if (comment.length < 5 && review.rating === 5) {
      isFake = true;
      flags.push("Extremely short perfect review");
    }
    let recommendation = "approve";
    if (isSpam || isInappropriate) {
      recommendation = "reject";
    } else if (isFake || flags.length > 0) {
      recommendation = "review";
    }
    const confidence = flags.length > 0 ? Math.min(0.7 + flags.length * 0.1, 0.95) : 0.5;
    return {
      isSpam,
      isFake,
      isInappropriate,
      flags,
      confidence,
      recommendation
    };
  }
  /**
   * AI Cart Recommendations - Suggest complementary products based on cart contents
   */
  async recommendCartProducts(cartItems, allProducts) {
    if (cartItems.length === 0) {
      return {
        recommendations: [],
        summary: "Add items to your cart to get personalized recommendations."
      };
    }
    const cartProductIds = cartItems.map((item) => item.product_id);
    const cartProducts = cartItems.map((item) => item.product).filter(Boolean);
    if (cartProducts.length === 0) {
      return {
        recommendations: [],
        summary: "Unable to analyze cart contents."
      };
    }
    const productCategories = /* @__PURE__ */ new Set();
    const productBrands = /* @__PURE__ */ new Set();
    const productTypes = [];
    cartProducts.forEach((product) => {
      if (product.component_category_id) {
        productCategories.add(product.component_category_id);
      }
      if (product.brand) {
        productBrands.add(product.brand);
      }
      const nameLower = (product.name || "").toLowerCase();
      const descLower = (product.description || "").toLowerCase();
      if (nameLower.includes("laptop") || descLower.includes("laptop")) productTypes.push("laptop");
      if (nameLower.includes("desktop") || descLower.includes("desktop"))
        productTypes.push("desktop");
      if (nameLower.includes("keyboard") || descLower.includes("keyboard"))
        productTypes.push("keyboard");
      if (nameLower.includes("mouse") || descLower.includes("mouse")) productTypes.push("mouse");
      if (nameLower.includes("monitor") || descLower.includes("monitor"))
        productTypes.push("monitor");
      if (nameLower.includes("headphone") || descLower.includes("headphone"))
        productTypes.push("headphone");
      if (nameLower.includes("speaker") || descLower.includes("speaker"))
        productTypes.push("speaker");
      if (nameLower.includes("cable") || descLower.includes("cable")) productTypes.push("cable");
      if (nameLower.includes("charger") || descLower.includes("charger"))
        productTypes.push("charger");
      if (nameLower.includes("bag") || descLower.includes("bag")) productTypes.push("bag");
    });
    const availableProducts = allProducts.filter(
      (p) => !cartProductIds.includes(p.id) && p.stock > 0
    );
    const recommendations = [];
    const recommendedIds = /* @__PURE__ */ new Set();
    const hasPCComponents = Array.from(productCategories).length > 0;
    if (hasPCComponents) {
      const cartCategories = Array.from(productCategories);
      let categoryMap = {};
      try {
        const { pcBuildService } = await import("./PCBuildService.js");
        const categories = await pcBuildService.getAllCategories();
        categories.forEach((cat) => {
          categoryMap[cat.id] = cat.name;
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
      const essentialCategoryKeywords = [
        "cpu",
        "processor",
        "motherboard",
        "ram",
        "memory",
        "storage",
        "ssd",
        "hdd",
        "gpu",
        "graphics",
        "psu",
        "power supply",
        "cooler",
        "case"
      ];
      for (const product of availableProducts) {
        if (recommendedIds.has(product.id)) continue;
        if (recommendations.length >= 8) break;
        if (!product.component_category_id) continue;
        const categoryId = product.component_category_id;
        const categoryName = categoryMap[categoryId] || "Component";
        const productName = (product.name || "").toLowerCase();
        const productDesc = (product.description || "").toLowerCase();
        const isEssential = essentialCategoryKeywords.some(
          (keyword) => productName.includes(keyword) || productDesc.includes(keyword) || categoryName.toLowerCase().includes(keyword)
        );
        if (isEssential && !cartCategories.includes(categoryId)) {
          recommendations.push({
            product,
            reason: `Complete your build: Add ${categoryName} for a full PC setup`,
            category: "complete_build"
          });
          recommendedIds.add(product.id);
        }
      }
    }
    if (productTypes.includes("laptop") || productTypes.includes("desktop")) {
      const accessoryKeywords = [
        "mouse",
        "keyboard",
        "monitor",
        "headphone",
        "speaker",
        "bag",
        "cable",
        "charger"
      ];
      for (const product of availableProducts) {
        if (recommendedIds.has(product.id)) continue;
        if (recommendations.length >= 8) break;
        const nameLower = (product.name || "").toLowerCase();
        const descLower = (product.description || "").toLowerCase();
        const isAccessory = accessoryKeywords.some(
          (keyword) => nameLower.includes(keyword) || descLower.includes(keyword)
        );
        if (isAccessory) {
          recommendations.push({
            product,
            reason: `You might also need: ${product.name} to complete your setup`,
            category: "complementary"
          });
          recommendedIds.add(product.id);
        }
      }
    }
    if (productTypes.includes("keyboard")) {
      for (const product of availableProducts) {
        if (recommendedIds.has(product.id)) continue;
        if (recommendations.length >= 8) break;
        const nameLower = (product.name || "").toLowerCase();
        if (nameLower.includes("mouse") && !productTypes.includes("mouse")) {
          recommendations.push({
            product,
            reason: "You might also need: A mouse to pair with your keyboard",
            category: "complementary"
          });
          recommendedIds.add(product.id);
        }
      }
    }
    if (productTypes.includes("monitor")) {
      for (const product of availableProducts) {
        if (recommendedIds.has(product.id)) continue;
        if (recommendations.length >= 8) break;
        const nameLower = (product.name || "").toLowerCase();
        if (nameLower.includes("cable") || nameLower.includes("stand")) {
          recommendations.push({
            product,
            reason: "You might also need: Accessories for your monitor",
            category: "complementary"
          });
          recommendedIds.add(product.id);
        }
      }
    }
    if (productBrands.size > 0) {
      const brandArray = Array.from(productBrands);
      for (const product of availableProducts) {
        if (recommendedIds.has(product.id)) continue;
        if (recommendations.length >= 8) break;
        if (product.brand && brandArray.includes(product.brand)) {
          recommendations.push({
            product,
            reason: `You might also need: More products from ${product.brand}`,
            category: "complementary"
          });
          recommendedIds.add(product.id);
        }
      }
    }
    if (recommendations.length === 0 && availableProducts.length > 0) {
      const fallbackProducts = availableProducts.filter((p) => p.stock > 0).slice(0, 4);
      fallbackProducts.forEach((product) => {
        if (!recommendedIds.has(product.id)) {
          recommendations.push({
            product,
            reason: "You might also like this popular item",
            category: "complementary"
          });
          recommendedIds.add(product.id);
        }
      });
    }
    let summary = "";
    if (recommendations.length === 0) {
      summary = "No recommendations available at the moment.";
    } else {
      const completeBuildCount = recommendations.filter(
        (r) => r.category === "complete_build"
      ).length;
      const complementaryCount = recommendations.filter(
        (r) => r.category === "complementary"
      ).length;
      if (completeBuildCount > 0 && complementaryCount > 0) {
        summary = `Based on your cart, we've found ${completeBuildCount} item(s) to complete your build and ${complementaryCount} complementary product(s).`;
      } else if (completeBuildCount > 0) {
        summary = `Complete your PC build! We've found ${completeBuildCount} essential component(s) you might be missing.`;
      } else {
        summary = `You might also need ${complementaryCount} item(s) to enhance your setup.`;
      }
    }
    return {
      recommendations: recommendations.slice(0, 6),
      summary
    };
  }
  /**
   * AI Product Description Generator
   * Generates SEO-optimized product descriptions from product information
   * Uses Google Gemini as primary, OpenAI as fallback
   */
  async generateProductDescription(product) {
    const geminiApiKey = private_env.GEMINI_API_KEY;
    const openaiApiKey = private_env.OPENAI_API_KEY;
    if (geminiApiKey) {
      try {
        return await this.generateProductDescriptionWithGemini(product);
      } catch (error) {
        console.warn("Gemini API error, trying OpenAI fallback:", error);
      }
    }
    if (openaiApiKey) {
      try {
        const openai = new OpenAI({
          apiKey: openaiApiKey
        });
        const prompt = `You are an expert e-commerce product description writer. Generate a compelling, SEO-optimized product description for the following product.

Product Information:
- Name: ${product.name}
${product.brand ? `- Brand: ${product.brand}` : ""}
${product.component_category_name ? `- Category: ${product.component_category_name}` : ""}
${product.specifications ? `- Specifications: ${product.specifications}` : ""}
${product.price ? `- Price: ${product.price} Taka (Bangladeshi currency)` : ""}

Requirements:
1. Write a professional, engaging product description (150-300 words)
2. Include key features and benefits
3. Use SEO-friendly language
4. Highlight unique selling points
5. Make it compelling for potential buyers
6. Include relevant technical details if specifications are provided

Return a JSON object with this structure:
{
  "description": "The full product description text",
  "keywords": ["keyword1", "keyword2", "keyword3", ...],
  "variations": [
    "Alternative description variation 1 (shorter, 50-100 words)",
    "Alternative description variation 2 (longer, 200-300 words)"
  ]
}

Important: Return ONLY valid JSON, no additional text or markdown formatting.`;
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert e-commerce copywriter specializing in tech products. Generate compelling, SEO-optimized product descriptions that help customers make informed purchasing decisions."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1e3,
          response_format: { type: "json_object" }
        });
        const aiResponse = response.choices[0]?.message?.content;
        if (!aiResponse) {
          throw new Error("No response from AI");
        }
        const parsed = JSON.parse(aiResponse);
        return {
          description: parsed.description || "",
          keywords: parsed.keywords || [],
          variations: parsed.variations || []
        };
      } catch (error) {
        if (error?.status === 429 || error?.code === "insufficient_quota" || error?.code === "rate_limit_exceeded") {
          console.warn(
            "OpenAI API quota exceeded or rate limited. Using rule-based description generation."
          );
        } else {
          console.error("Error generating product description with AI:", error);
        }
        return this.generateProductDescriptionRuleBased(product);
      }
    }
    return this.generateProductDescriptionRuleBased(product);
  }
  /**
   * Generate product description using Google Gemini
   */
  async generateProductDescriptionWithGemini(product) {
    const geminiApiKey = private_env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are an expert e-commerce product description writer. Generate a compelling, SEO-optimized product description for the following product.

Product Information:
- Name: ${product.name}
${product.brand ? `- Brand: ${product.brand}` : ""}
${product.component_category_name ? `- Category: ${product.component_category_name}` : ""}
${product.specifications ? `- Specifications: ${product.specifications}` : ""}
${product.price ? `- Price: ${product.price} Taka (Bangladeshi currency)` : ""}

Requirements:
1. Write a professional, engaging product description (150-300 words)
2. Include key features and benefits
3. Use SEO-friendly language
4. Highlight unique selling points
5. Make it compelling for potential buyers
6. Include relevant technical details if specifications are provided

Return a JSON object with this structure:
{
  "description": "The full product description text",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "variations": [
    "Alternative description variation 1 (shorter, 50-100 words)",
    "Alternative description variation 2 (longer, 200-300 words)"
  ]
}

Important: Return ONLY valid JSON, no additional text or markdown formatting.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    const parsed = JSON.parse(jsonText);
    return {
      description: parsed.description || "",
      keywords: parsed.keywords || [],
      variations: parsed.variations || []
    };
  }
  /**
   * Generate sales report summary using Gemini
   */
  async generateSalesReportSummary(salesData) {
    const geminiApiKey = private_env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return this.generateSalesReportSummaryRuleBased(salesData);
    }
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate a professional executive summary for a sales report.

Sales Data:
- Period: ${salesData.period}
- Total Revenue: ${salesData.totalRevenue.toFixed(2)} Taka
- Total Orders: ${salesData.totalOrders}
- Trends: ${salesData.trends}
- Top Products:
${salesData.topProducts.map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} units sold, ${p.revenue.toFixed(2)} Taka revenue`).join("\n")}

Requirements:
1. Write a concise executive summary (100-200 words)
2. Highlight key achievements and insights
3. Mention top-performing products
4. Include actionable recommendations
5. Use professional business language
6. Focus on what matters most to management

Return only the summary text, no additional formatting.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Error generating sales report summary with Gemini:", error);
      return this.generateSalesReportSummaryRuleBased(salesData);
    }
  }
  /**
   * Rule-based sales report summary (fallback)
   */
  generateSalesReportSummaryRuleBased(salesData) {
    return `Sales Report Summary for ${salesData.period}

Total Revenue: ${salesData.totalRevenue.toFixed(2)} Taka
Total Orders: ${salesData.totalOrders}

${salesData.trends}

Top Performing Products:
${salesData.topProducts.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} units, ${p.revenue.toFixed(2)} Taka`).join("\n")}

Recommendations:
- Continue promoting top-performing products
- Monitor trends and adjust inventory accordingly
- Focus on customer retention strategies`;
  }
  /**
   * Analyze customer behavior using Gemini
   */
  async analyzeCustomerBehavior(customerData) {
    const geminiApiKey = private_env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return this.analyzeCustomerBehaviorRuleBased(customerData);
    }
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze customer behavior and provide insights.

Customer Data:
- Total Orders: ${customerData.totalOrders}
- Total Spent: ${customerData.totalSpent.toFixed(2)} Taka
- Average Order Value: ${customerData.averageOrderValue.toFixed(2)} Taka
- Last Order: ${customerData.lastOrderDate || "N/A"}
- Order Frequency: ${customerData.orderFrequency} orders per month
- Preferred Categories: ${customerData.preferredCategories.join(", ") || "N/A"}

Requirements:
1. Provide behavioral insights (2-3 sentences)
2. Suggest 3-5 actionable recommendations
3. Determine customer segment (Champion, Loyal, At Risk, New, Lost)
4. Return as JSON:
{
  "insights": "Customer behavior insights...",
  "recommendations": ["recommendation1", "recommendation2", ...],
  "segment": "Champion|Loyal|At Risk|New|Lost"
}

Return ONLY valid JSON.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      if (text.startsWith("```json")) {
        text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/```\n?/g, "");
      }
      const parsed = JSON.parse(text);
      return {
        insights: parsed.insights || "",
        recommendations: parsed.recommendations || [],
        segment: parsed.segment || "Unknown"
      };
    } catch (error) {
      console.error("Error analyzing customer behavior with Gemini:", error);
      return this.analyzeCustomerBehaviorRuleBased(customerData);
    }
  }
  /**
   * Rule-based customer behavior analysis (fallback)
   */
  analyzeCustomerBehaviorRuleBased(customerData) {
    const daysSinceLastOrder = customerData.lastOrderDate ? Math.floor(
      (Date.now() - new Date(customerData.lastOrderDate).getTime()) / (1e3 * 60 * 60 * 24)
    ) : 999;
    let segment = "New";
    if (customerData.totalOrders >= 5 && customerData.totalSpent > 5e4 && daysSinceLastOrder <= 30) {
      segment = "Champion";
    } else if (customerData.totalOrders >= 3 && daysSinceLastOrder <= 60) {
      segment = "Loyal";
    } else if (daysSinceLastOrder > 90) {
      segment = "Lost";
    } else if (daysSinceLastOrder > 60) {
      segment = "At Risk";
    }
    const insights = `Customer has made ${customerData.totalOrders} orders with total value of ${customerData.totalSpent.toFixed(2)} Taka. ${daysSinceLastOrder > 90 ? "No recent activity detected." : `Last order was ${daysSinceLastOrder} days ago.`}`;
    const recommendations = [];
    if (segment === "At Risk") {
      recommendations.push("Send re-engagement email with special offer");
      recommendations.push("Offer personalized product recommendations");
    } else if (segment === "Champion") {
      recommendations.push("Offer VIP loyalty program benefits");
      recommendations.push("Request product reviews");
    } else if (segment === "Loyal") {
      recommendations.push("Send regular product updates");
      recommendations.push("Offer complementary products");
    }
    return { insights, recommendations, segment };
  }
  /**
   * Generate marketing content suggestions using Gemini
   */
  async generateMarketingContent(product) {
    const geminiApiKey = private_env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return this.generateMarketingContentRuleBased(product);
    }
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate marketing content for a product.

Product Information:
- Name: ${product.name}
- Price: ${product.price} Taka
- Category: ${product.category || "General"}
- Stock: ${product.stock} units available

Requirements:
Generate marketing content in JSON format:
{
  "emailSubject": "Compelling email subject line (max 60 characters)",
  "emailBody": "Email body text (100-150 words) promoting the product",
  "socialMediaPost": "Social media post (100-150 characters) with hashtags",
  "adCopy": "Short ad copy for advertisements (50-80 words)"
}

Return ONLY valid JSON.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      if (text.startsWith("```json")) {
        text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/```\n?/g, "");
      }
      const parsed = JSON.parse(text);
      return {
        emailSubject: parsed.emailSubject || `Check out ${product.name}!`,
        emailBody: parsed.emailBody || `Discover ${product.name} at just ${product.price} Taka!`,
        socialMediaPost: parsed.socialMediaPost || `${product.name} - Now available! #TinyTech`,
        adCopy: parsed.adCopy || `Get ${product.name} today!`
      };
    } catch (error) {
      console.error("Error generating marketing content with Gemini:", error);
      return this.generateMarketingContentRuleBased(product);
    }
  }
  /**
   * Rule-based marketing content generation (fallback)
   */
  generateMarketingContentRuleBased(product) {
    return {
      emailSubject: `Special Offer: ${product.name}`,
      emailBody: `Don't miss out on ${product.name}! Available now at ${product.price} Taka. ${product.stock > 0 ? "Limited stock available!" : "Order now!"} Visit TinyTech to learn more.`,
      socialMediaPost: `🔥 ${product.name} - Now at ${product.price} Taka! Limited stock. Shop now! #TinyTech #TechDeals`,
      adCopy: `${product.name} - Premium quality at ${product.price} Taka. Shop now at TinyTech!`
    };
  }
  /**
   * Rule-based product description generator (fallback)
   */
  generateProductDescriptionRuleBased(product) {
    const parts = [];
    const keywords = [];
    parts.push(`Introducing the ${product.name}`);
    if (product.brand) {
      parts.push(`from ${product.brand}`);
      keywords.push(product.brand.toLowerCase());
    }
    if (product.component_category_name) {
      parts.push(
        `- a premium ${product.component_category_name.toLowerCase()} designed for exceptional performance.`
      );
      keywords.push(product.component_category_name.toLowerCase());
    } else {
      parts.push(`- a high-quality product designed for exceptional performance.`);
    }
    if (product.specifications) {
      parts.push(`

Key Features:
${product.specifications}`);
      const specWords = product.specifications.toLowerCase().match(/\b\w{4,}\b/g) || [];
      keywords.push(...specWords.slice(0, 5));
    }
    if (product.price) {
      parts.push(
        `

Available at an attractive price of Tk ${product.price.toFixed(2)}, this product offers excellent value for money.`
      );
    }
    parts.push(
      `

Perfect for both professionals and enthusiasts, this product combines quality, performance, and reliability. Order now and experience the difference!`
    );
    const description = parts.join(" ");
    const nameWords = product.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    keywords.push(...nameWords.slice(0, 5));
    const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
    const shortVariation = `${product.name}${product.brand ? ` by ${product.brand}` : ""}. ${product.specifications ? product.specifications.split("\n").slice(0, 2).join(". ") : "High-quality product with excellent features."} Available now!`;
    const longVariation = description;
    return {
      description,
      keywords: uniqueKeywords,
      variations: [shortVariation, longVariation]
    };
  }
  /**
   * Enhanced Sales Predictions with statistical forecasting
   */
  async predictSalesEnhanced(sales) {
    if (sales.length === 0) {
      return {
        predictedSales: 0,
        predictedRevenue: 0,
        trend: "stable",
        confidence: 0.3,
        scenarios: { optimistic: 0, realistic: 0, pessimistic: 0 },
        factors: ["Insufficient data"],
        timeHorizons: {
          "7days": { sales: 0, revenue: 0 },
          "14days": { sales: 0, revenue: 0 },
          "30days": { sales: 0, revenue: 0 },
          "90days": { sales: 0, revenue: 0 }
        }
      };
    }
    const salesByDate = sales.reduce(
      (acc, sale) => {
        if (!sale.created_at) return acc;
        const date = new Date(sale.created_at).toDateString();
        if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
        acc[date].count += sale.quantity;
        acc[date].revenue += sale.total_amount;
        return acc;
      },
      {}
    );
    const dates = Object.keys(salesByDate).sort();
    const dailySales = dates.map((date) => salesByDate[date].count);
    const dailyRevenues = dates.map((date) => salesByDate[date].revenue);
    const ma7Sales = enhancedAIService.calculateSimpleMovingAverage(dailySales, 7);
    const ma14Sales = enhancedAIService.calculateSimpleMovingAverage(dailySales, 14);
    const lastMA7 = ma7Sales[ma7Sales.length - 1];
    const lastMA14 = ma14Sales[ma14Sales.length - 1];
    const baselineSales = !isNaN(lastMA7) ? lastMA7 : !isNaN(lastMA14) ? lastMA14 : dailySales.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const baselineRevenue = dailyRevenues.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const trend = enhancedAIService.detectTrend(dailySales);
    const predictions = {
      "7days": { sales: Math.round(baselineSales * 7), revenue: baselineRevenue * 7 },
      "14days": { sales: Math.round(baselineSales * 14), revenue: baselineRevenue * 14 },
      "30days": { sales: Math.round(baselineSales * 30), revenue: baselineRevenue * 30 },
      "90days": { sales: Math.round(baselineSales * 90), revenue: baselineRevenue * 90 }
    };
    const trendMultiplier = trend === "increasing" ? 1.1 : trend === "decreasing" ? 0.9 : 1;
    predictions["30days"].sales = Math.round(predictions["30days"].sales * trendMultiplier);
    predictions["30days"].revenue = predictions["30days"].revenue * trendMultiplier;
    const scenarios = {
      optimistic: Math.round(predictions["30days"].sales * 1.2),
      realistic: predictions["30days"].sales,
      pessimistic: Math.round(predictions["30days"].sales * 0.8)
    };
    const confidence = Math.min(
      0.95,
      Math.max(0.3, 0.5 + sales.length / 100 * 0.3 + (dates.length >= 30 ? 0.15 : 0))
    );
    const factors = [];
    if (trend === "increasing") factors.push("Sales trend is increasing");
    else if (trend === "decreasing") factors.push("Sales trend is decreasing");
    factors.push(`Based on ${sales.length} sales records`);
    factors.push(`Average daily sales: ${baselineSales.toFixed(1)} units`);
    return {
      predictedSales: predictions["30days"].sales,
      predictedRevenue: predictions["30days"].revenue,
      trend,
      confidence,
      scenarios,
      factors,
      timeHorizons: {
        "7days": predictions["7days"],
        "14days": predictions["14days"],
        "30days": predictions["30days"],
        "90days": predictions["90days"]
      }
    };
  }
  /**
   * Enhanced Stock Recommendations with EOQ and reorder points
   */
  async getStockRecommendationsEnhanced(products, sales) {
    const recommendations = [];
    const DEFAULT_LEAD_TIME = 7;
    const DEFAULT_ORDERING_COST = 500;
    const DEFAULT_HOLDING_COST = 10;
    for (const product of products) {
      const productSales = sales.filter((s) => s.product_id === product.id);
      if (productSales.length === 0) {
        if (product.stock < 10) {
          recommendations.push({
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            recommendedOrder: 20,
            urgency: product.stock === 0 ? "high" : "medium",
            reason: "No sales history - recommended initial stock",
            estimatedStockoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
            priorityScore: product.stock === 0 ? 0.9 : 0.5,
            salesVelocity: 0,
            leadTime: DEFAULT_LEAD_TIME,
            reorderPoint: 10,
            safetyStock: 5,
            eoq: 20
          });
        }
        continue;
      }
      const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const firstSaleDate = new Date(
        Math.min(...productSales.map((s) => new Date(s.created_at || Date.now()).getTime()))
      );
      const daysOfData = Math.max(
        1,
        Math.floor((Date.now() - firstSaleDate.getTime()) / (1e3 * 60 * 60 * 24))
      );
      const salesVelocity = totalSold / daysOfData;
      const annualDemand = salesVelocity * 365;
      const salesArray = productSales.map((s) => s.quantity);
      const avgSales = salesArray.reduce((a, b) => a + b, 0) / salesArray.length;
      const variance = salesArray.reduce((sum, val) => sum + Math.pow(val - avgSales, 2), 0) / salesArray.length;
      const stdDev = Math.sqrt(variance);
      const safetyStock = enhancedAIService.calculateSafetyStock(
        salesVelocity,
        stdDev,
        DEFAULT_LEAD_TIME
      );
      const reorderPoint = enhancedAIService.calculateReorderPoint(
        salesVelocity,
        DEFAULT_LEAD_TIME,
        safetyStock
      );
      const eoq = enhancedAIService.calculateEOQ(
        annualDemand,
        DEFAULT_ORDERING_COST,
        DEFAULT_HOLDING_COST
      );
      let estimatedStockoutDate;
      if (product.stock === 0) {
        estimatedStockoutDate = (/* @__PURE__ */ new Date()).toISOString();
      } else if (salesVelocity > 0) {
        const daysUntilStockout = Math.floor(product.stock / salesVelocity);
        estimatedStockoutDate = new Date(
          Date.now() + daysUntilStockout * 24 * 60 * 60 * 1e3
        ).toISOString();
      } else {
        estimatedStockoutDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString();
      }
      let urgency = "low";
      let priorityScore = 0;
      const stockRatio = product.stock / reorderPoint;
      if (product.stock === 0 || stockRatio < 0.2) {
        urgency = "high";
        priorityScore = 0.95;
      } else if (stockRatio < 0.5) {
        urgency = "high";
        priorityScore = 0.8;
      } else if (stockRatio < 0.8) {
        urgency = "medium";
        priorityScore = 0.6;
      } else {
        urgency = "low";
        priorityScore = 0.3;
      }
      if (product.stock < reorderPoint) {
        const recommendedOrder = Math.max(eoq, reorderPoint - product.stock + safetyStock);
        let reason = "";
        if (product.stock === 0) {
          reason = `Out of stock. Sales velocity: ${salesVelocity.toFixed(2)} units/day. Lead time: ${DEFAULT_LEAD_TIME} days.`;
        } else {
          reason = `Stock (${product.stock}) below reorder point (${reorderPoint}). Sales velocity: ${salesVelocity.toFixed(2)} units/day. Estimated stockout: ${new Date(estimatedStockoutDate).toLocaleDateString()}.`;
        }
        recommendations.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          recommendedOrder: Math.ceil(recommendedOrder),
          urgency,
          reason,
          estimatedStockoutDate,
          priorityScore,
          salesVelocity,
          leadTime: DEFAULT_LEAD_TIME,
          reorderPoint,
          safetyStock,
          eoq: Math.ceil(eoq)
        });
      }
    }
    return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  }
  /**
   * Enhanced Customer Insights with RFM Analysis
   */
  async getCustomerInsightsEnhanced(sales) {
    if (sales.length === 0) {
      return {
        totalCustomers: 0,
        averageOrderValue: 0,
        customerLifetimeValue: 0,
        topCustomers: [],
        churnRiskCustomers: [],
        segments: {
          champions: 0,
          loyal: 0,
          atRisk: 0,
          new: 0,
          lost: 0
        },
        recommendations: []
      };
    }
    const customerData = sales.reduce(
      (acc, sale) => {
        const userId = sale.user_id || "guest";
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: sale.user_name || "Guest",
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: null,
            orderDates: []
          };
        }
        acc[userId].totalSpent += sale.total_amount;
        acc[userId].orderCount += 1;
        if (sale.created_at) {
          acc[userId].orderDates.push(sale.created_at);
          if (!acc[userId].lastOrderDate || sale.created_at > acc[userId].lastOrderDate) {
            acc[userId].lastOrderDate = sale.created_at;
          }
        }
        return acc;
      },
      {}
    );
    const customers = Object.values(customerData);
    const rfmSegments = enhancedAIService.performRFMAnalysis(
      customers.map((c) => ({
        userId: c.userId,
        userName: c.userName,
        lastOrderDate: c.lastOrderDate,
        orderCount: c.orderCount,
        totalSpent: c.totalSpent
      }))
    );
    const segments = {
      champions: rfmSegments.filter((s) => s.segment === "Champion").length,
      loyal: rfmSegments.filter((s) => s.segment === "Loyal").length,
      atRisk: rfmSegments.filter((s) => s.segment === "At Risk").length,
      new: rfmSegments.filter((s) => s.segment === "New").length,
      lost: rfmSegments.filter((s) => s.segment === "Lost").length
    };
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const averageOrderValue = totalRevenue / sales.length;
    const avgPurchaseFrequency = customers.length > 0 ? customers.reduce((sum, c) => sum + c.orderCount, 0) / customers.length : 0;
    const avgCustomerLifespan = 12;
    const customerLifetimeValue = enhancedAIService.calculateCLV(
      averageOrderValue,
      avgPurchaseFrequency,
      avgCustomerLifespan
    );
    const topCustomers = customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map((c) => ({
      userId: c.userId,
      userName: c.userName,
      totalSpent: c.totalSpent,
      orderCount: c.orderCount
    }));
    const churnRiskCustomers = rfmSegments.filter((s) => s.segment === "At Risk" || s.segment === "Lost").slice(0, 10).map((segment) => {
      customers.find((c) => c.userId === segment.userId);
      const daysSinceLastOrder = segment.recency;
      const riskFactors = [];
      if (daysSinceLastOrder > 90) riskFactors.push("No order in 90+ days");
      if (segment.frequency < 2) riskFactors.push("Low purchase frequency");
      if (segment.recency > 60 && segment.frequency >= 2)
        riskFactors.push("Declining engagement");
      const churnProbability = segment.segment === "Lost" ? 0.9 : 0.7;
      return {
        userId: segment.userId,
        userName: segment.userName,
        churnProbability,
        riskFactors
      };
    });
    const recommendations = [];
    if (segments.atRisk > 0) {
      recommendations.push(`Focus retention campaigns on ${segments.atRisk} at-risk customers`);
    }
    if (segments.champions > 0) {
      recommendations.push(`Reward ${segments.champions} champion customers with VIP benefits`);
    }
    if (segments.loyal > 0) {
      recommendations.push(`Upsell opportunities with ${segments.loyal} loyal customers`);
    }
    if (segments.lost > 0) {
      recommendations.push(`Re-engage ${segments.lost} lost customers with special offers`);
    }
    return {
      totalCustomers: customers.length,
      averageOrderValue,
      customerLifetimeValue,
      topCustomers,
      churnRiskCustomers,
      segments,
      recommendations
    };
  }
  /**
   * Score order risk
   */
  async scoreOrderRisk(order) {
    const factors = [];
    let riskScore = 0;
    if (order.total_amount > 5e4) {
      riskScore += 0.2;
      factors.push("High order value");
    }
    if (!order.user_id) {
      riskScore += 0.15;
      factors.push("Guest checkout");
    }
    if (order.customer_address && order.customer_address.length < 10) {
      riskScore += 0.1;
      factors.push("Incomplete address");
    }
    if (order.payment_method === "cash_on_delivery" && order.total_amount > 3e4) {
      riskScore += 0.15;
      factors.push("High-value COD order");
    }
    let riskLevel = "low";
    if (riskScore >= 0.5) riskLevel = "high";
    else if (riskScore >= 0.3) riskLevel = "medium";
    const recommendations = [];
    if (riskLevel === "high") {
      recommendations.push("Verify customer identity");
      recommendations.push("Consider additional payment verification");
    } else if (riskLevel === "medium") {
      recommendations.push("Monitor order closely");
    }
    return {
      orderId: order.id,
      riskScore: Math.min(riskScore, 1),
      riskLevel,
      factors,
      recommendations
    };
  }
  /**
   * Analyze product performance
   */
  async analyzeProductPerformance(productId, product, sales, reviews) {
    const productSales = sales.filter((s) => s.product_id === productId);
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const firstSaleDate = productSales.length > 0 ? new Date(
      Math.min(...productSales.map((s) => new Date(s.created_at || Date.now()).getTime()))
    ) : /* @__PURE__ */ new Date();
    const daysOfData = Math.max(
      1,
      Math.floor((Date.now() - firstSaleDate.getTime()) / (1e3 * 60 * 60 * 24))
    );
    const salesVelocity = totalSold / daysOfData;
    const productRevenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const revenueContribution = totalRevenue > 0 ? productRevenue / totalRevenue * 100 : 0;
    const totalCost = productSales.reduce((sum, s) => sum + (s.cost_price || 0) * s.quantity, 0);
    const profitMargin = productRevenue > 0 ? (productRevenue - totalCost) / productRevenue * 100 : 0;
    const customerSatisfaction = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const returnRate = 0;
    const annualSales = salesVelocity * 365;
    const averageInventory = product.stock;
    const stockTurnover = averageInventory > 0 ? annualSales / averageInventory : 0;
    const recommendations = [];
    if (salesVelocity > 5 && product.stock < 20) {
      recommendations.push("Consider increasing stock - high demand product");
    }
    if (profitMargin < 10) {
      recommendations.push("Review pricing - low profit margin");
    }
    if (customerSatisfaction < 3 && reviews.length > 5) {
      recommendations.push("Address customer concerns - low satisfaction scores");
    }
    if (stockTurnover < 2) {
      recommendations.push("Consider promotions to increase stock turnover");
    }
    return {
      productId,
      productName: product.name,
      salesVelocity,
      revenueContribution,
      profitMargin,
      customerSatisfaction,
      returnRate,
      stockTurnover,
      recommendations
    };
  }
  /**
   * Calculate Customer Lifetime Value for a specific customer
   */
  async calculateCustomerLifetimeValue(userId, sales) {
    const customerSales = sales.filter((s) => s.user_id === userId);
    if (customerSales.length === 0) {
      return {
        currentValue: 0,
        predictedValue: 0,
        purchaseFrequency: 0,
        averageOrderValue: 0,
        customerLifespan: 0,
        segment: "low"
      };
    }
    const totalSpent = customerSales.reduce((sum, s) => sum + s.total_amount, 0);
    const averageOrderValue = totalSpent / customerSales.length;
    const firstSaleDate = new Date(
      Math.min(...customerSales.map((s) => new Date(s.created_at || Date.now()).getTime()))
    );
    const monthsAsCustomer = Math.max(
      1,
      (Date.now() - firstSaleDate.getTime()) / (1e3 * 60 * 60 * 24 * 30)
    );
    const purchaseFrequency = customerSales.length / monthsAsCustomer;
    const customerLifespan = monthsAsCustomer + (purchaseFrequency > 0 ? 12 / purchaseFrequency : 6);
    const currentValue = totalSpent;
    const predictedValue = enhancedAIService.calculateCLV(
      averageOrderValue,
      purchaseFrequency,
      customerLifespan
    );
    let segment = "low";
    if (predictedValue > 5e4) segment = "high";
    else if (predictedValue > 2e4) segment = "medium";
    return {
      currentValue,
      predictedValue,
      purchaseFrequency,
      averageOrderValue,
      customerLifespan,
      segment
    };
  }
  /**
   * Predict churn for all customers
   */
  async predictChurn(sales) {
    const customerData = sales.reduce(
      (acc, sale) => {
        const userId = sale.user_id || "guest";
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: sale.user_name || "Guest",
            orderCount: 0,
            lastOrderDate: null,
            totalSpent: 0
          };
        }
        acc[userId].orderCount += 1;
        acc[userId].totalSpent += sale.total_amount;
        if (sale.created_at) {
          if (!acc[userId].lastOrderDate || sale.created_at > acc[userId].lastOrderDate) {
            acc[userId].lastOrderDate = sale.created_at;
          }
        }
        return acc;
      },
      {}
    );
    const customers = Object.values(customerData);
    const now = Date.now();
    const predictions = customers.map((customer) => {
      const daysSinceLastOrder = customer.lastOrderDate ? Math.floor((now - new Date(customer.lastOrderDate).getTime()) / (1e3 * 60 * 60 * 24)) : 999;
      let churnProbability = 0;
      const riskFactors = [];
      if (daysSinceLastOrder > 180) {
        churnProbability = 0.9;
        riskFactors.push("No order in 180+ days");
      } else if (daysSinceLastOrder > 90) {
        churnProbability = 0.7;
        riskFactors.push("No order in 90+ days");
      } else if (daysSinceLastOrder > 60) {
        churnProbability = 0.5;
        riskFactors.push("No order in 60+ days");
      }
      if (customer.orderCount === 1 && daysSinceLastOrder > 30) {
        churnProbability += 0.2;
        riskFactors.push("Single purchase customer");
      }
      const recommendedActions = [];
      if (churnProbability > 0.7) {
        recommendedActions.push("Send re-engagement email with special offer");
        recommendedActions.push("Offer personalized product recommendations");
      } else if (churnProbability > 0.5) {
        recommendedActions.push("Send follow-up email");
        recommendedActions.push("Offer discount on next purchase");
      }
      return {
        userId: customer.userId,
        userName: customer.userName,
        churnProbability: Math.min(churnProbability, 1),
        riskFactors,
        recommendedActions,
        daysSinceLastOrder
      };
    }).filter((p) => p.churnProbability > 0.4).sort((a, b) => b.churnProbability - a.churnProbability);
    return predictions;
  }
}
const aiService = new AIService();
export {
  AIService,
  aiService
};
