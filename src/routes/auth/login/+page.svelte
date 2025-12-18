<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  interface Props {
    form: ActionData;
  }

  let { form }: Props = $props();

  let loading = $state(false);
</script>

<svelte:head>
  <title>Sign In - E-Commerce</title>
</svelte:head>

<div class="max-w-md mx-auto mt-12">
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-3xl font-bold text-center mb-2">Welcome Back</h1>
    <p class="text-gray-600 text-center mb-8">Sign in to your account</p>

    {#if form?.error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
        {form.message}
      </div>
    {/if}

    <form
      method="POST"
      action="?/login"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
    >
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
          value={form?.email ?? ""}
        />
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <a
            href="/auth/forgot-password"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Don't have an account?
        <a href="/auth/signup" class="text-blue-600 hover:text-blue-700 font-medium">
          Sign up
        </a>
      </p>
    </div>
  </div>
</div>
