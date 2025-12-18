<script lang="ts">
  import "../../app.css";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();
</script>

<div class="min-h-screen bg-gray-100">
  <!-- Admin Header -->
  <header class="bg-gray-900 text-white shadow-lg">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <a href="/admin" class="text-2xl font-bold text-blue-400">
            Admin Panel
          </a>
          <nav class="flex items-center gap-4">
            <a
              href="/admin"
              class="hover:text-blue-400 transition-colors text-sm"
              >Dashboard</a
            >
            <a
              href="/admin/products"
              class="hover:text-blue-400 transition-colors text-sm"
              >Products</a
            >
            <a
              href="/admin/orders"
              class="hover:text-blue-400 transition-colors text-sm">Orders</a
            >
            <a
              href="/admin/users"
              class="hover:text-blue-400 transition-colors text-sm">Users</a
            >
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-300">
            {data.profile?.email || "Admin"}
          </span>
          <a href="/" class="text-sm hover:text-blue-400 transition-colors">
            Back to Store
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Admin Content -->
  <main class="container mx-auto px-4 py-8">
    {@render children()}
  </main>
</div>

