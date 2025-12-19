<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { formatCurrency } from "$lib/utils/formatCurrency";
  import { enhance } from "$app/forms";
  import { sanitizeSlug } from "$lib/utils/validators";
  import { page } from "$app/stores";

  let { data }: { data: PageData } = $props();

  // Form state
  let activeSection = $state<"add" | "remove" | "edit">("add");
  let editingProduct = $state<any>(null);
  let productName = $state("");
  let productSlug = $state("");
  let productDescription = $state("");
  let productPrice = $state("");
  let productCost = $state("");
  let productImageUrl = $state("");
  let productCategory = $state("");
  let productStock = $state("0");
  let imageUploadMethod = $state<"url" | "upload">("url");
  let uploadedFile = $state<File | null>(null);
  let uploadedFilePreview = $state<string | null>(null);

  // Available categories
  const categories = [
    { value: "", label: "Select Category" },
    { value: "keycaps", label: "Keycaps" },
    { value: "switch", label: "Switch" },
    { value: "keyboard", label: "Keyboard" },
    { value: "mouse", label: "Mouse" },
    { value: "mousepad", label: "Mouse Pad" }
  ];
  
  // Search state
  let searchRemoveQuery = $state("");
  let searchEditQuery = $state("");

  // Filter products based on search query
  function filterProducts(products: any[], query: string) {
    if (!query.trim()) return products;
    
    const lowerQuery = query.toLowerCase().trim();
    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const slug = product.slug?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const price = product.price?.toString() || "";
      
      return (
        name.includes(lowerQuery) ||
        slug.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        price.includes(lowerQuery)
      );
    });
  }

  // Get filtered products for remove section
  let filteredRemoveProducts = $derived(filterProducts(data.products, searchRemoveQuery));

  // Get filtered products for edit section
  let filteredEditProducts = $derived(filterProducts(data.products, searchEditQuery));

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    productName = name;
    if (!editingProduct) {
      productSlug = sanitizeSlug(name);
    }
  }

  // Load product data for editing
  function loadProductForEdit(product: any) {
    editingProduct = product;
    productName = product.name;
    productSlug = product.slug;
    productDescription = product.description || "";
    productPrice = product.price;
    productCost = product.cost?.toString() || "";
    productImageUrl = product.imageUrl || "";
    productStock = product.stock.toString();
    activeSection = "edit";
  }

  // Reset form
  function resetForm() {
    editingProduct = null;
    productName = "";
    productSlug = "";
    productDescription = "";
    productPrice = "";
    productCost = "";
    productImageUrl = "";
    productCategory = "";
    productStock = "0";
    imageUploadMethod = "url";
    uploadedFile = null;
    uploadedFilePreview = null;
    searchRemoveQuery = "";
    searchEditQuery = "";
  }

  // Handle file upload
  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    uploadedFile = file;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid file type (JPG, PNG, GIF, WEBP, or PDF)");
      uploadedFile = null;
      uploadedFilePreview = null;
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      uploadedFile = null;
      uploadedFilePreview = null;
      return;
    }

    // Create preview for images (not PDFs)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFilePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      uploadedFilePreview = null;
    }
  }

  // Handle form success
  $effect(() => {
    if ($page.form?.success) {
      resetForm();
      // Refresh page data
      window.location.reload();
    }
  });
</script>

<div>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold">Admin Dashboard</h1>
    <a
      href="/admin/financial"
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
    >
      📊 Financial Dashboard
    </a>
    <a
      href="/admin/financial"
      class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
    >
      💰 Financial Dashboard
    </a>
  </div>

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

  <!-- Section Tabs -->
  <div class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="flex gap-4 border-b">
      <button
        onclick={() => {
          activeSection = "add";
          resetForm();
        }}
        class="px-6 py-2 font-medium transition-colors {activeSection === 'add'
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        ➕ Add Product
      </button>
      <button
        onclick={() => {
          activeSection = "remove";
          resetForm();
        }}
        class="px-6 py-2 font-medium transition-colors {activeSection === 'remove'
          ? 'text-red-600 border-b-2 border-red-600'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        🗑️ Remove Products
      </button>
      <button
        onclick={() => {
          activeSection = "edit";
          resetForm();
        }}
        class="px-6 py-2 font-medium transition-colors {activeSection === 'edit'
          ? 'text-green-600 border-b-2 border-green-600'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        ✏️ Edit Product
      </button>
    </div>
  </div>

  <!-- Section 1: Add Product -->
  {#if activeSection === "add"}
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-6">Add New Product</h2>
      <form method="POST" action="?/addProduct" use:enhance enctype="multipart/form-data">
        <div class="space-y-4 max-w-2xl">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              bind:value={productName}
              oninput={(e) => handleNameChange(e.currentTarget.value)}
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              bind:value={productSlug}
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="product-slug"
            />
            <p class="text-xs text-gray-500 mt-1">URL-friendly identifier (auto-generated from name)</p>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              bind:value={productDescription}
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product description"
            ></textarea>
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              bind:value={productCategory}
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                bind:value={productPrice}
                step="0.01"
                min="0"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                bind:value={productStock}
                min="0"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <p class="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </p>
            
            <!-- Upload Method Selection -->
            <div class="flex gap-4 mb-4">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="imageMethod"
                  value="url"
                  bind:group={imageUploadMethod}
                  class="mr-2"
                />
                <span class="text-sm">Use URL</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="imageMethod"
                  value="upload"
                  bind:group={imageUploadMethod}
                  class="mr-2"
                />
                <span class="text-sm">Upload File</span>
              </label>
            </div>

            <!-- URL Input -->
            {#if imageUploadMethod === "url"}
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                bind:value={productImageUrl}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {#if productImageUrl}
                <div class="mt-2">
                  <img
                    src={productImageUrl}
                    alt="Preview"
                    class="max-w-xs max-h-48 rounded border"
                    onerror={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              {/if}
            {/if}

            <!-- File Upload Input -->
            {#if imageUploadMethod === "upload"}
              <div>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*,.pdf"
                  onchange={handleFileUpload}
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WEBP, PDF (Max 5MB)
                </p>
                
                <!-- File Preview -->
                {#if uploadedFilePreview}
                  <div class="mt-4">
                    <p class="text-sm font-medium mb-2">Preview:</p>
                    <img
                      src={uploadedFilePreview}
                      alt="Upload preview"
                      class="max-w-xs max-h-48 rounded border"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      File: {uploadedFile?.name} ({(uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0')} MB)
                    </p>
                  </div>
                {:else if uploadedFile && uploadedFile.type === "application/pdf"}
                  <div class="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                    <p class="text-sm font-medium">PDF File Selected:</p>
                    <p class="text-xs text-gray-600">{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                    <p class="text-xs text-gray-500 mt-1">PDF preview not available. File will be uploaded.</p>
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          {#if $page.form?.error}
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {$page.form.error}
            </div>
          {/if}

          {#if $page.form?.success}
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Product added successfully!
            </div>
          {/if}

          <button
            type="submit"
            class="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Section 2: Remove Products -->
  {#if activeSection === "remove"}
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold">Remove Products</h2>
        <div class="flex items-center gap-2">
          <div class="relative">
            <input
              type="text"
              bind:value={searchRemoveQuery}
              placeholder="Search products..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          {#if searchRemoveQuery}
            <button
              type="button"
              onclick={() => (searchRemoveQuery = "")}
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              title="Clear search"
            >
              ✕
            </button>
          {/if}
        </div>
      </div>
      
      {#if data.products.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-600 mb-4">No products found</p>
        </div>
      {:else if filteredRemoveProducts.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-600 mb-4">No products match your search: "{searchRemoveQuery}"</p>
          <button
            type="button"
            onclick={() => (searchRemoveQuery = "")}
            class="text-blue-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      {:else}
        <div class="mb-4 text-sm text-gray-600">
          Showing {filteredRemoveProducts.length} of {data.products.length} products
        </div>
        <div class="space-y-4">
          {#each filteredRemoveProducts as product (product.id)}
            <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div class="flex items-center gap-4 flex-1">
                {#if product.imageUrl}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    class="h-16 w-16 object-cover rounded"
                  />
                {:else}
                  <div class="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                {/if}
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">{product.name}</h3>
                  <p class="text-sm text-gray-600">{product.slug}</p>
                  <p class="text-sm font-medium text-blue-600">
                    {formatCurrency(parseFloat(product.price))}
                  </p>
                </div>
              </div>
              <form method="POST" action="?/deleteProduct" use:enhance class="ml-4">
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  onclick={(e) => {
                    if (!confirm(`Are you sure you want to delete ${product.name}? This action cannot be undone.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Section 3: Edit Product -->
  {#if activeSection === "edit"}
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-6">Edit Product</h2>
      
      {#if !editingProduct}
        <!-- Product Selection -->
        {#if data.products.length === 0}
          <div class="text-center py-8">
            <p class="text-gray-600 mb-4">No products found</p>
          </div>
        {:else}
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <p class="block text-sm font-medium text-gray-700">
                Select a product to edit:
              </p>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input
                    type="text"
                    bind:value={searchEditQuery}
                    placeholder="Search products..."
                    class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                  />
                  <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
                {#if searchEditQuery}
                  <button
                    type="button"
                    onclick={() => (searchEditQuery = "")}
                    class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                    title="Clear search"
                  >
                    ✕
                  </button>
                {/if}
              </div>
            </div>
            
            {#if filteredEditProducts.length === 0}
              <div class="text-center py-8 border rounded-lg bg-gray-50">
                <p class="text-gray-600 mb-4">No products match your search: "{searchEditQuery}"</p>
                <button
                  type="button"
                  onclick={() => (searchEditQuery = "")}
                  class="text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            {:else}
              <div class="mb-4 text-sm text-gray-600">
                Showing {filteredEditProducts.length} of {data.products.length} products
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each filteredEditProducts as product (product.id)}
                <button
                  type="button"
                  onclick={() => loadProductForEdit(product)}
                  class="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors text-left w-full"
                >
                  <div class="flex items-center gap-3">
                    {#if product.imageUrl}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        class="h-12 w-12 object-cover rounded"
                      />
                    {:else}
                      <div class="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    {/if}
                    <div class="flex-1">
                      <h3 class="font-semibold">{product.name}</h3>
                      <p class="text-sm text-gray-600">{formatCurrency(parseFloat(product.price))}</p>
                    </div>
                  </div>
                </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {:else}
        <!-- Edit Form -->
        <form method="POST" action="?/updateProduct" use:enhance enctype="multipart/form-data">
          <input type="hidden" name="id" value={editingProduct.id} />
          <div class="space-y-4 max-w-2xl">
            <div>
              <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                bind:value={productName}
                oninput={(e) => handleNameChange(e.currentTarget.value)}
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label for="edit-slug" class="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                id="edit-slug"
                name="slug"
                bind:value={productSlug}
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="edit-description"
                name="description"
                bind:value={productDescription}
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              ></textarea>
            </div>

            <div>
              <label for="edit-category" class="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="edit-category"
                name="category"
                bind:value={productCategory}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {#each categories as cat}
                  <option value={cat.value}>{cat.label}</option>
                {/each}
              </select>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label for="edit-price" class="block text-sm font-medium text-gray-700 mb-1">
                  Price * (Selling Price)
                </label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  bind:value={productPrice}
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label for="edit-cost" class="block text-sm font-medium text-gray-700 mb-1">
                  Cost (Product Cost)
                </label>
                <input
                  type="number"
                  id="edit-cost"
                  name="cost"
                  bind:value={productCost}
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p class="text-xs text-gray-500 mt-1">Used for profit calculation</p>
              </div>

              <div>
                <label for="edit-stock" class="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  id="edit-stock"
                  name="stock"
                  bind:value={productStock}
                  min="0"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <p class="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </p>
              
              <!-- Upload Method Selection -->
              <div class="flex gap-4 mb-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="editImageMethod"
                    value="url"
                    bind:group={imageUploadMethod}
                    class="mr-2"
                  />
                  <span class="text-sm">Use URL</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="editImageMethod"
                    value="upload"
                    bind:group={imageUploadMethod}
                    class="mr-2"
                  />
                  <span class="text-sm">Upload File</span>
                </label>
              </div>

              <!-- URL Input -->
              {#if imageUploadMethod === "url"}
                <input
                  type="url"
                  id="edit-imageUrl"
                  name="imageUrl"
                  bind:value={productImageUrl}
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/image.jpg"
                />
                {#if productImageUrl}
                  <div class="mt-2">
                    <img
                      src={productImageUrl}
                      alt="Preview"
                      class="max-w-xs max-h-48 rounded border"
                      onerror={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                {/if}
              {/if}

              <!-- File Upload Input -->
              {#if imageUploadMethod === "upload"}
                <div>
                  <input
                    type="file"
                    id="edit-imageFile"
                    name="imageFile"
                    accept="image/*,.pdf"
                    onchange={handleFileUpload}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF, WEBP, PDF (Max 5MB)
                  </p>
                  
                  <!-- File Preview -->
                  {#if uploadedFilePreview}
                    <div class="mt-4">
                      <p class="text-sm font-medium mb-2">Preview:</p>
                      <img
                        src={uploadedFilePreview}
                        alt="Upload preview"
                        class="max-w-xs max-h-48 rounded border"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        File: {uploadedFile?.name} ({(uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0')} MB)
                      </p>
                    </div>
                  {:else if uploadedFile && uploadedFile.type === "application/pdf"}
                    <div class="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                      <p class="text-sm font-medium">PDF File Selected:</p>
                      <p class="text-xs text-gray-600">{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                      <p class="text-xs text-gray-500 mt-1">PDF preview not available. File will be uploaded.</p>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>

            {#if $page.form?.error}
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {$page.form.error}
              </div>
            {/if}

            {#if $page.form?.success}
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Product updated successfully!
              </div>
            {/if}

            <div class="flex gap-4">
              <button
                type="submit"
                class="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Update Product
              </button>
              <button
                type="button"
                onclick={() => {
                  resetForm();
                }}
                class="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      {/if}
    </div>
  {/if}
</div>

