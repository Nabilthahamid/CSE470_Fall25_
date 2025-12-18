<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div>
  <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <!-- Total Products -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm">Total Products</p>
          <p class="text-3xl font-bold text-blue-600">
            {data.stats.totalProducts}
          </p>
        </div>
        <div class="text-4xl">📦</div>
      </div>
    </div>

    <!-- Total Users -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm">Total Users</p>
          <p class="text-3xl font-bold text-green-600">
            {data.stats.totalUsers}
          </p>
        </div>
        <div class="text-4xl">👥</div>
      </div>
    </div>

    <!-- Total Orders -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm">Total Orders</p>
          <p class="text-3xl font-bold text-purple-600">
            {data.stats.totalOrders}
          </p>
        </div>
        <div class="text-4xl">🛒</div>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <a
        href="/admin/products/new"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
      >
        ➕ Add Product
      </a>
      <a
        href="/admin/products"
        class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
      >
        📝 Manage Products
      </a>
      <a
        href="/admin/orders"
        class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center"
      >
        📋 View Orders
      </a>
      <a
        href="/admin/users"
        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
      >
        👤 Manage Users
      </a>
    </div>
  </div>
</div>

