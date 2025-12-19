<script lang="ts">
  import { formatCurrency } from "$lib/utils/formatCurrency";
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";

  let { data }: { data: PageData } = $props();
</script>

<div>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold">Manage Products</h1>
    <a
      href="/admin/products/new"
      class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      ➕ Add New Product
    </a>
  </div>

  {#if data.products.length === 0}
    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <p class="text-gray-600 mb-4">No products found</p>
      <a
        href="/admin/products/new"
        class="text-blue-600 hover:underline">Add your first product</a
      >
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Product
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Stock
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.products as product (product.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  {#if product.imageUrl}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      class="h-10 w-10 rounded object-cover"
                    />
                  {/if}
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div class="text-sm text-gray-500">{product.slug}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {formatCurrency(parseFloat(product.price))}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{product.stock}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if product.stock > 0}
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    In Stock
                  </span>
                {:else}
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                  >
                    Out of Stock
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a
                  href="/admin/products/{product.id}/edit"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </a>
                <form method="POST" action="?/delete" use:enhance class="inline">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    class="text-red-600 hover:text-red-900"
                    onclick={(e) => {
                      if (!confirm(`Are you sure you want to delete ${product.name}?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

