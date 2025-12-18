<script lang="ts">
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const allPassed =
    data.clientCheck &&
    data.adminCheck &&
    data.drizzleCheck &&
    data.tablesCheck &&
    data.authCheck;

  const percentage = [
    data.clientCheck,
    data.adminCheck,
    data.drizzleCheck,
    data.tablesCheck,
    data.authCheck,
  ].filter(Boolean).length * 20;
</script>

<svelte:head>
  <title>Supabase Connection Test</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <div class="mb-8">
    <h1 class="text-4xl font-bold mb-2">Supabase Connection Test</h1>
    <p class="text-gray-600">
      Testing your Supabase configuration and database connection
    </p>
  </div>

  <!-- Overall Status -->
  <div
    class="mb-8 p-6 rounded-lg border-2 {allPassed
      ? 'bg-green-50 border-green-300'
      : 'bg-yellow-50 border-yellow-300'}"
  >
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold {allPassed ? 'text-green-700' : 'text-yellow-700'}">
          {allPassed ? "✅ All Systems Operational" : "⚠️ Setup Incomplete"}
        </h2>
        <p class="text-gray-600 mt-1">
          {allPassed
            ? "Your Supabase connection is fully configured and working!"
            : "Some configuration steps are needed"}
        </p>
      </div>
      <div class="text-right">
        <div class="text-5xl font-bold {allPassed ? 'text-green-600' : 'text-yellow-600'}">
          {percentage}%
        </div>
        <div class="text-sm text-gray-600">Complete</div>
      </div>
    </div>
  </div>

  <!-- Test Results -->
  <div class="space-y-4">
    <!-- Client Check -->
    <div
      class="p-4 rounded-lg border-2 {data.clientCheck
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300'}"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-bold text-lg flex items-center gap-2">
            {data.clientCheck ? "✅" : "❌"}
            Client Connection (PUBLIC_SUPABASE_ANON_KEY)
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {data.clientCheck
              ? "Client-side Supabase connection is working"
              : "Client-side connection failed - check your PUBLIC_SUPABASE_ANON_KEY"}
          </p>
        </div>
      </div>
    </div>

    <!-- Admin Check -->
    <div
      class="p-4 rounded-lg border-2 {data.adminCheck
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300'}"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-bold text-lg flex items-center gap-2">
            {data.adminCheck ? "✅" : "❌"}
            Admin Connection (SUPABASE_SERVICE_ROLE_KEY)
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {data.adminCheck
              ? "Server-side admin connection is working"
              : "Admin connection failed - check your SUPABASE_SERVICE_ROLE_KEY"}
          </p>
        </div>
      </div>
    </div>

    <!-- Drizzle Check -->
    <div
      class="p-4 rounded-lg border-2 {data.drizzleCheck
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300'}"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-bold text-lg flex items-center gap-2">
            {data.drizzleCheck ? "✅" : "❌"}
            Drizzle ORM (DATABASE_URL)
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {data.drizzleCheck
              ? "Direct database connection via Drizzle ORM is working"
              : "Drizzle connection failed - check your DATABASE_URL"}
          </p>
        </div>
      </div>
    </div>

    <!-- Tables Check -->
    <div
      class="p-4 rounded-lg border-2 {data.tablesCheck
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300'}"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="font-bold text-lg flex items-center gap-2">
            {data.tablesCheck ? "✅" : "❌"}
            Database Tables
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {data.tablesCheck
              ? "All required tables exist"
              : "Some tables are missing - run supabase-schema.sql"}
          </p>
          {#if data.details.tables.length > 0}
            <div class="mt-2 flex flex-wrap gap-2">
              {#each data.details.tables as table}
                <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">
                  {table}
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Auth Check -->
    <div
      class="p-4 rounded-lg border-2 {data.authCheck
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300'}"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-bold text-lg flex items-center gap-2">
            {data.authCheck ? "✅" : "❌"}
            Authentication System
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {data.authCheck
              ? "Supabase Auth is working correctly"
              : "Auth system failed - check your service role key"}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Errors Section -->
  {#if data.errors.length > 0}
    <div class="mt-8 p-6 bg-red-50 border-2 border-red-300 rounded-lg">
      <h3 class="font-bold text-lg text-red-700 mb-3">🚨 Errors Detected</h3>
      <ul class="space-y-2">
        {#each data.errors as error}
          <li class="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
            {error}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Environment Details -->
  <div class="mt-8 p-6 bg-gray-50 border-2 border-gray-300 rounded-lg">
    <h3 class="font-bold text-lg text-gray-700 mb-3">📋 Configuration Details</h3>
    <div class="space-y-2 text-sm font-mono">
      <div class="flex justify-between">
        <span class="text-gray-600">Supabase URL:</span>
        <span class="text-gray-900">{data.details.supabaseUrl}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Anon Key Set:</span>
        <span class="{data.details.hasAnonKey ? 'text-green-600' : 'text-red-600'}">
          {data.details.hasAnonKey ? "✅ Yes" : "❌ No"}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Service Key Set:</span>
        <span class="{data.details.hasServiceKey ? 'text-green-600' : 'text-red-600'}">
          {data.details.hasServiceKey ? "✅ Yes" : "❌ No"}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Database URL Set:</span>
        <span class="{data.details.hasDatabaseUrl ? 'text-green-600' : 'text-red-600'}">
          {data.details.hasDatabaseUrl ? "✅ Yes" : "❌ No"}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Tables Found:</span>
        <span class="text-gray-900">{data.details.tables.length} / 4</span>
      </div>
    </div>
  </div>

  <!-- Setup Instructions -->
  {#if !allPassed}
    <div class="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
      <h3 class="font-bold text-lg text-blue-700 mb-3">📚 Setup Instructions</h3>
      <div class="space-y-4 text-sm">
        {#if !data.details.hasAnonKey || !data.details.hasServiceKey || !data.details.hasDatabaseUrl}
          <div>
            <h4 class="font-bold text-blue-700 mb-1">1. Set Environment Variables</h4>
            <p class="text-gray-700 mb-2">
              Create or update your <code class="bg-blue-100 px-1 rounded">.env</code> file with:
            </p>
            <pre class="bg-blue-100 p-3 rounded text-xs overflow-x-auto">PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres</pre>
          </div>
        {/if}

        {#if !data.tablesCheck}
          <div>
            <h4 class="font-bold text-blue-700 mb-1">2. Create Database Tables</h4>
            <p class="text-gray-700 mb-2">
              In Supabase SQL Editor, run the <code class="bg-blue-100 px-1 rounded">supabase-schema.sql</code> file from your project.
            </p>
            <ol class="list-decimal list-inside space-y-1 text-gray-700 ml-2">
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Copy content from supabase-schema.sql</li>
              <li>Paste and click "Run"</li>
              <li>Verify tables in Table Editor</li>
            </ol>
          </div>
        {/if}

        <div>
          <h4 class="font-bold text-blue-700 mb-1">3. Restart Dev Server</h4>
          <p class="text-gray-700">
            After making changes, restart your dev server to load new environment variables.
          </p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Actions -->
  <div class="mt-8 flex gap-4">
    <a
      href="/"
      class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Go to Home
    </a>
    <button
      onclick={() => window.location.reload()}
      class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      🔄 Retest Connection
    </button>
  </div>
</div>

