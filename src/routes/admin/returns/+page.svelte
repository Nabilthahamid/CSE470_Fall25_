<!-- VIEW: Returns & Refunds Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let activeTab = data.activeTab || 'requests';
	let selectedReturn: any = null;
	let showRefundModal = false;
	let refundAmount = 0;
	let refundMethod = 'original_payment';
	let adminNotes = '';

	function openRefundModal(returnRequest: any) {
		selectedReturn = returnRequest;
		refundAmount = returnRequest.refund_amount || 0;
		refundMethod = returnRequest.refund_method || 'original_payment';
		adminNotes = returnRequest.admin_notes || '';
		showRefundModal = true;
	}

	function closeRefundModal() {
		selectedReturn = null;
		showRefundModal = false;
		refundAmount = 0;
		refundMethod = 'original_payment';
		adminNotes = '';
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'approved':
				return 'bg-blue-100 text-blue-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			case 'refunded':
				return 'bg-green-100 text-green-800';
			case 'completed':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Returns & Refunds - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Returns & Refunds Management</h1>

	<!-- Filters -->
	<div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label for="return-status-filter" class="block mb-2 text-sm font-medium">Status</label>
				<select
					id="return-status-filter"
					class="p-2 border-2 border-gray-300 rounded-lg"
					on:change={(e) => {
						const status = e.currentTarget.value;
						const params = new URLSearchParams();
						if (status) params.set('status', status);
						if (data.filters.startDate) params.set('startDate', data.filters.startDate);
						if (data.filters.endDate) params.set('endDate', data.filters.endDate);
						params.set('tab', activeTab);
						window.location.href = `/admin/returns?${params.toString()}`;
					}}
				>
					<option value="">All Statuses</option>
					<option value="pending" selected={data.filters.status === 'pending'}>Pending</option>
					<option value="approved" selected={data.filters.status === 'approved'}>Approved</option>
					<option value="rejected" selected={data.filters.status === 'rejected'}>Rejected</option>
					<option value="refunded" selected={data.filters.status === 'refunded'}>Refunded</option>
					<option value="completed" selected={data.filters.status === 'completed'}>Completed</option>
				</select>
			</div>
			<div>
				<label for="return-start-date" class="block mb-2 text-sm font-medium">Start Date</label>
				<input
					id="return-start-date"
					type="date"
					value={data.filters.startDate || ''}
					class="p-2 border-2 border-gray-300 rounded-lg"
					on:change={(e) => {
						const startDate = e.currentTarget.value;
						const params = new URLSearchParams();
						if (startDate) params.set('startDate', startDate);
						if (data.filters.endDate) params.set('endDate', data.filters.endDate);
						if (data.filters.status) params.set('status', data.filters.status);
						params.set('tab', activeTab);
						window.location.href = `/admin/returns?${params.toString()}`;
					}}
				/>
			</div>
			<div>
				<label for="return-end-date" class="block mb-2 text-sm font-medium">End Date</label>
				<input
					id="return-end-date"
					type="date"
					value={data.filters.endDate || ''}
					class="p-2 border-2 border-gray-300 rounded-lg"
					on:change={(e) => {
						const endDate = e.currentTarget.value;
						const params = new URLSearchParams();
						if (data.filters.startDate) params.set('startDate', data.filters.startDate);
						if (endDate) params.set('endDate', endDate);
						if (data.filters.status) params.set('status', data.filters.status);
						params.set('tab', activeTab);
						window.location.href = `/admin/returns?${params.toString()}`;
					}}
				/>
			</div>
			<button
				on:click={() => window.location.href = '/admin/returns'}
				class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
			>
				Clear Filters
			</button>
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => activeTab = 'requests'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Return Requests
			</button>
			<button
				on:click={() => activeTab = 'analytics'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Analytics
			</button>
		</div>
	</div>

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
			Operation successful!
		</div>
	{/if}

	<!-- Return Requests Tab -->
	{#if activeTab === 'requests'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Return Requests</h2>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund Amount</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each data.returns as returnRequest}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 font-mono text-sm text-gray-900">{returnRequest.order_id.slice(0, 8)}</td>
								<td class="px-6 py-4 text-gray-600">{returnRequest.product_id.slice(0, 8)}</td>
								<td class="px-6 py-4 text-gray-600">{returnRequest.quantity}</td>
								<td class="px-6 py-4 text-gray-600">{returnRequest.reason}</td>
								<td class="px-6 py-4">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(returnRequest.status)}">
										{returnRequest.status}
									</span>
								</td>
								<td class="px-6 py-4 font-semibold text-gray-900">
									{returnRequest.refund_amount ? `Tk ${returnRequest.refund_amount.toFixed(2)}` : 'N/A'}
								</td>
								<td class="px-6 py-4 text-gray-600">
									{returnRequest.created_at ? new Date(returnRequest.created_at).toLocaleDateString() : 'N/A'}
								</td>
								<td class="px-6 py-4">
									<div class="flex gap-2">
										{#if returnRequest.status === 'pending'}
											<form method="POST" action="?/approveReturn" use:enhance class="inline">
												<input type="hidden" name="id" value={returnRequest.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
												>
													Approve
												</button>
											</form>
											<form method="POST" action="?/rejectReturn" use:enhance class="inline">
												<input type="hidden" name="id" value={returnRequest.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
												>
													Reject
												</button>
											</form>
										{/if}
										{#if returnRequest.status === 'approved'}
											<button
												on:click={() => openRefundModal(returnRequest)}
												class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
											>
												Process Refund
											</button>
										{/if}
										{#if returnRequest.status === 'refunded'}
											<form method="POST" action="?/completeReturn" use:enhance class="inline">
												<input type="hidden" name="id" value={returnRequest.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
												>
													Complete
												</button>
											</form>
										{/if}
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="8" class="px-6 py-8 text-center text-gray-500">No return requests found</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- Analytics Tab -->
	{#if activeTab === 'analytics'}
		<div class="space-y-6">
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Returns</h3>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.totalReturns}</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Return Rate</h3>
					<p class="text-3xl font-bold text-indigo-600">{data.analytics.returnRate.toFixed(2)}%</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Refunded</h3>
					<p class="text-3xl font-bold text-red-600">Tk {data.analytics.totalRefunded.toFixed(2)}</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Avg Refund</h3>
					<p class="text-3xl font-bold text-green-600">Tk {data.analytics.averageRefundAmount.toFixed(2)}</p>
				</div>
			</div>

			<!-- Return Reasons -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Returns by Reason</h2>
				<div class="space-y-3">
					{#each data.analytics.byReason as item}
						<div>
							<div class="flex justify-between items-center mb-1">
								<span class="text-gray-700 font-medium">{item.reason}</span>
								<span class="text-gray-900 font-semibold">{item.count} ({item.percentage.toFixed(1)}%)</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div
									class="bg-indigo-600 h-2 rounded-full"
									style="width: {item.percentage}%"
								></div>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-4">No return reasons data</p>
					{/each}
				</div>
			</div>

			<!-- Returns by Status -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Returns by Status</h2>
				<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
					{#each data.analytics.byStatus as item}
						<div class="text-center p-4 bg-gray-50 rounded-lg">
							<p class="text-2xl font-bold text-gray-900 mb-1">{item.count}</p>
							<p class="text-sm text-gray-600 capitalize">{item.status}</p>
							<p class="text-xs text-gray-500 mt-1">{item.percentage.toFixed(1)}%</p>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-4 col-span-full">No status data</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Refund Modal -->
	{#if showRefundModal && selectedReturn}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			on:click={closeRefundModal}
			role="dialog"
			aria-modal="true"
			aria-labelledby="refund-modal-title"
		>
			<div
				class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
				on:click|stopPropagation
			>
				<h2 id="refund-modal-title" class="text-2xl font-bold text-gray-900 mb-4">Process Refund</h2>
				<form method="POST" action="?/processRefund" use:enhance>
					<input type="hidden" name="id" value={selectedReturn.id} />
					<div class="space-y-4">
						<div>
							<label for="refund-amount" class="block mb-2 font-medium">Refund Amount *</label>
							<input
								id="refund-amount"
								type="number"
								name="refund_amount"
								bind:value={refundAmount}
								required
								min="0"
								step="0.01"
								class="w-full p-3 border-2 border-gray-300 rounded-lg"
							/>
						</div>
						<div>
							<label for="refund-method" class="block mb-2 font-medium">Refund Method *</label>
							<select
								id="refund-method"
								name="refund_method"
								bind:value={refundMethod}
								required
								class="w-full p-3 border-2 border-gray-300 rounded-lg"
							>
								<option value="original_payment">Original Payment Method</option>
								<option value="bank_transfer">Bank Transfer</option>
								<option value="store_credit">Store Credit</option>
								<option value="cash">Cash</option>
							</select>
						</div>
						<div>
							<label for="admin-notes" class="block mb-2 font-medium">Admin Notes</label>
							<textarea
								id="admin-notes"
								name="admin_notes"
								bind:value={adminNotes}
								rows="3"
								class="w-full p-3 border-2 border-gray-300 rounded-lg"
							></textarea>
						</div>
						<div class="flex gap-3">
							<button type="submit" class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
								Process Refund
							</button>
							<button
								type="button"
								on:click={closeRefundModal}
								class="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
							>
								Cancel
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>

