<script lang="ts">
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";

  let { data }: { data: PageData } = $props();
</script>

<div>
  <h1 class="text-3xl font-bold mb-8">Manage Users</h1>

  {#if data.users.length === 0}
    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <p class="text-gray-600">No users found</p>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              User
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Role
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Joined
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.users as user (user.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {user.fullName || "No Name"}
                  </div>
                  <div class="text-sm text-gray-500">{user.email}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if user.role === "admin"}
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800"
                  >
                    👑 Admin
                  </span>
                {:else}
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    👤 User
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <form method="POST" action="?/updateRole" use:enhance class="inline">
                  <input type="hidden" name="userId" value={user.id} />
                  {#if user.role === "admin"}
                    <input type="hidden" name="role" value="user" />
                    <button
                      type="submit"
                      class="text-gray-600 hover:text-gray-900"
                      onclick="return confirm('Remove admin privileges from this user?')"
                    >
                      Remove Admin
                    </button>
                  {:else}
                    <input type="hidden" name="role" value="admin" />
                    <button
                      type="submit"
                      class="text-blue-600 hover:text-blue-900"
                      onclick="return confirm('Grant admin privileges to this user?')"
                    >
                      Make Admin
                    </button>
                  {/if}
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <!-- Info Box -->
  <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 class="text-sm font-semibold text-blue-900 mb-2">
      ℹ️ Admin Role Information
    </h3>
    <ul class="text-sm text-blue-700 space-y-1">
      <li>• Admin users can access the admin panel</li>
      <li>• Admin users can manage products, orders, and other users</li>
      <li>
        • You can also set admin role directly in Supabase database (see
        ADMIN_SETUP.md)
      </li>
    </ul>
  </div>
</div>

