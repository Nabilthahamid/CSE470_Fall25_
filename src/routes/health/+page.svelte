<script lang="ts">
	import type { PageData } from './$types';
	import { CheckCircle2, XCircle, Clock } from 'lucide-svelte';

	export let data: PageData;

	const statusColor =
		data.connectionStatus === 'success'
			? 'text-green-600'
			: data.connectionStatus === 'error'
				? 'text-red-600'
				: 'text-slate-600';

	const statusBg =
		data.connectionStatus === 'success'
			? 'bg-green-50'
			: data.connectionStatus === 'error'
				? 'bg-red-50'
				: 'bg-slate-50';
</script>

<svelte:head>
	<title>Server Health Check - TinyShop</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl">
		<div class="rounded-lg bg-white shadow-lg">
			<div class="border-b border-slate-200 px-6 py-5">
				<h1 class="text-2xl font-bold text-slate-900">Server Connection Status</h1>
				<p class="mt-1 text-sm text-slate-500">Supabase Database Health Check</p>
			</div>

			<div class="px-6 py-5">
				<!-- Connection Status -->
				<div class="mb-6">
					<div class="flex items-center gap-3">
						{#if data.connectionStatus === 'success'}
							<CheckCircle2 class="h-8 w-8 text-green-600" />
							<span class="text-lg font-semibold text-green-600">
								Connection Successful
							</span>
						{:else if data.connectionStatus === 'error'}
							<XCircle class="h-8 w-8 text-red-600" />
							<span class="text-lg font-semibold text-red-600">
								Connection Failed
							</span>
						{:else}
							<Clock class="h-8 w-8 text-slate-600" />
							<span class="text-lg font-semibold text-slate-600">
								Checking...
							</span>
						{/if}
					</div>
				</div>

				<!-- Status Details -->
				<div class="space-y-4">
					<div class="rounded-lg border border-slate-200 p-4">
						<div class="mb-2 text-sm font-medium text-slate-700">Status</div>
						<div class="text-lg font-semibold {statusColor}">
							{data.connectionStatus.toUpperCase()}
						</div>
					</div>

					{#if data.queryTime !== null}
						<div class="rounded-lg border border-slate-200 p-4">
							<div class="mb-2 text-sm font-medium text-slate-700">
								Query Response Time
							</div>
							<div class="text-lg font-semibold text-slate-900">
								{data.queryTime}ms
							</div>
						</div>
					{/if}

					{#if data.productCount !== null}
						<div class="rounded-lg border border-slate-200 p-4">
							<div class="mb-2 text-sm font-medium text-slate-700">
								Products in Database
							</div>
							<div class="text-lg font-semibold text-slate-900">
								{data.productCount}
							</div>
						</div>
					{/if}

					{#if data.errorMessage}
						<div class="rounded-lg border border-red-200 bg-red-50 p-4">
							<div class="mb-2 text-sm font-medium text-red-700">Error Message</div>
							<div class="font-mono text-sm text-red-900">{data.errorMessage}</div>
						</div>
					{/if}

					<div class="rounded-lg border border-slate-200 p-4">
						<div class="mb-2 text-sm font-medium text-slate-700">Last Checked</div>
						<div class="text-sm text-slate-600">{data.timestamp}</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="mt-6 flex gap-4">
					<a
						href="/health"
						class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
					>
						Refresh
					</a>
					<a
						href="/shop"
						class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
					>
						Go to Shop
					</a>
				</div>
			</div>
		</div>

		<!-- Environment Info (for debugging) -->
		<div class="mt-6 rounded-lg bg-slate-100 p-4 text-xs text-slate-600">
			<div class="font-semibold">Environment:</div>
			<div>SUPABASE_URL: Configured</div>
			<div>SERVICE_ROLE_KEY: {data.connectionStatus === 'success' ? 'Valid' : 'Unknown'}</div>
		</div>
	</div>
</div>

