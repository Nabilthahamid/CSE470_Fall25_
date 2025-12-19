<script lang="ts">
  import type { PageData } from "./$types";
  import { formatCurrency } from "$lib/utils/formatCurrency";
  import { goto } from "$app/navigation";

  let { data }: { data: PageData } = $props();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function handleDateRangeChange(range: string) {
    goto(`/admin/financial?range=${range}`);
  }

  // Calculate change percentage
  function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
</script>

<svelte:head>
  <title>Financial Dashboard - Tinytech Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold">Financial Dashboard</h1>
    
    <!-- Date Range Selector -->
    <div class="flex items-center gap-4">
      <label for="dateRange" class="text-sm font-medium text-gray-700">Period:</label>
      <select
        id="dateRange"
        value={data.dateRange}
        onchange={(e) => handleDateRangeChange(e.currentTarget.value)}
        class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="365">Last year</option>
      </select>
      
      <!-- PDF Export Button -->
      <a
        href="/admin/financial/report?range={data.dateRange}"
        target="_blank"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        📄 Download PDF Report
      </a>
    </div>
  </div>

  <!-- Today's Quick Stats -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm font-medium">Today's Revenue</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(data.todayMetrics.totalRevenue)}
          </p>
          {#if data.yesterdayMetrics.totalRevenue > 0}
            {@const change = calculateChange(data.todayMetrics.totalRevenue, data.yesterdayMetrics.totalRevenue)}
            <p class="text-xs mt-1 {change >= 0 ? 'text-green-600' : 'text-red-600'}">
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs yesterday
            </p>
          {/if}
        </div>
        <div class="text-3xl">💰</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm font-medium">Today's Costs</p>
          <p class="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(data.todayMetrics.totalCost)}
          </p>
          {#if data.yesterdayMetrics.totalCost > 0}
            {@const change = calculateChange(data.todayMetrics.totalCost, data.yesterdayMetrics.totalCost)}
            <p class="text-xs mt-1 {change >= 0 ? 'text-red-600' : 'text-green-600'}">
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs yesterday
            </p>
          {/if}
        </div>
        <div class="text-3xl">📊</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm font-medium">Today's Profit</p>
          <p class="text-2xl font-bold {data.todayMetrics.profit >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
            {formatCurrency(data.todayMetrics.profit)}
          </p>
          {#if data.yesterdayMetrics.profit !== 0}
            {@const change = calculateChange(data.todayMetrics.profit, data.yesterdayMetrics.profit)}
            <p class="text-xs mt-1 {change >= 0 ? 'text-green-600' : 'text-red-600'}">
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs yesterday
            </p>
          {/if}
        </div>
        <div class="text-3xl">📈</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm font-medium">Today's Orders</p>
          <p class="text-2xl font-bold text-purple-600 mt-1">
            {data.todayMetrics.orderCount}
          </p>
          {#if data.yesterdayMetrics.orderCount > 0}
            {@const change = calculateChange(data.todayMetrics.orderCount, data.yesterdayMetrics.orderCount)}
            <p class="text-xs mt-1 {change >= 0 ? 'text-green-600' : 'text-red-600'}">
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs yesterday
            </p>
          {/if}
        </div>
        <div class="text-3xl">🛒</div>
      </div>
    </div>
  </div>

  <!-- Overall Period Stats -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
      <p class="text-blue-100 text-sm font-medium">Total Revenue</p>
      <p class="text-3xl font-bold mt-2">{formatCurrency(data.metrics.totalRevenue)}</p>
      <p class="text-blue-100 text-xs mt-2">{data.metrics.orderCount} orders</p>
    </div>

    <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
      <p class="text-orange-100 text-sm font-medium">Total Costs</p>
      <p class="text-3xl font-bold mt-2">{formatCurrency(data.metrics.totalCost)}</p>
      <p class="text-orange-100 text-xs mt-2">Product costs</p>
    </div>

    <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
      <p class="text-green-100 text-sm font-medium">Net Profit</p>
      <p class="text-3xl font-bold mt-2">{formatCurrency(data.metrics.profit)}</p>
      <p class="text-green-100 text-xs mt-2">Revenue - Costs</p>
    </div>

    <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <p class="text-purple-100 text-sm font-medium">Profit Margin</p>
      <p class="text-3xl font-bold mt-2">{data.metrics.profitMargin.toFixed(1)}%</p>
      <p class="text-purple-100 text-xs mt-2">{(data.metrics.totalRevenue / (data.metrics.orderCount || 1)).toFixed(0)} avg/order</p>
    </div>
  </div>

  <!-- Daily Profit/Loss Chart -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-2xl font-bold mb-6">Daily Profit/Loss Trend</h2>
    {#if data.dailyData.length > 0}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.dailyData as day}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDate(day.date)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatCurrency(day.revenue)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatCurrency(day.cost)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold {day.profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatCurrency(day.profit)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                  {day.orderCount}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        No financial data available for this period.
      </div>
    {/if}
  </div>

  <!-- Top Selling Products -->
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6">Top Selling Products</h2>
    {#if data.topProducts.length > 0}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.topProducts as product}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.productName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                  {product.quantitySold}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatCurrency(product.revenue)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatCurrency(product.cost * product.quantitySold)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold {product.profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatCurrency(product.profit)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        No product sales data available for this period.
      </div>
    {/if}
  </div>
</div>
