<!-- VIEW: Financial Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let activeTab = data.activeTab || 'overview';
	let showExpenseForm = false;
	let editingExpense: any = null;
	let startDate = data.startDate || '';
	let endDate = data.endDate || '';

	// Expense form
	let expenseCategory = '';
	let expenseDescription = '';
	let expenseAmount = 0;
	let expenseDate = new Date().toISOString().split('T')[0];
	let expensePaymentMethod = '';
	let expenseReceiptUrl = '';
	let expenseNotes = '';

	function editExpense(expense: any) {
		editingExpense = expense;
		expenseCategory = expense.category;
		expenseDescription = expense.description;
		expenseAmount = expense.amount;
		expenseDate = expense.date.split('T')[0];
		expensePaymentMethod = expense.payment_method || '';
		expenseReceiptUrl = expense.receipt_url || '';
		expenseNotes = expense.notes || '';
		showExpenseForm = true;
	}

	function resetExpenseForm() {
		editingExpense = null;
		expenseCategory = '';
		expenseDescription = '';
		expenseAmount = 0;
		expenseDate = new Date().toISOString().split('T')[0];
		expensePaymentMethod = '';
		expenseReceiptUrl = '';
		expenseNotes = '';
		showExpenseForm = false;
	}

	function applyDateFilter() {
		const params = new URLSearchParams();
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		params.set('tab', activeTab);
		window.location.href = `/admin/financial?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Financial Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Financial Management</h1>

	<!-- Date Filter -->
	<div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label for="financial-start-date" class="block mb-2 text-sm font-medium">Start Date</label>
				<input
					id="financial-start-date"
					type="date"
					bind:value={startDate}
					class="p-2 border-2 border-gray-300 rounded-lg"
				/>
			</div>
			<div>
				<label for="financial-end-date" class="block mb-2 text-sm font-medium">End Date</label>
				<input
					id="financial-end-date"
					type="date"
					bind:value={endDate}
					class="p-2 border-2 border-gray-300 rounded-lg"
				/>
			</div>
			<button
				on:click={applyDateFilter}
				class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
			>
				Apply Filter
			</button>
			<button
				on:click={() => {
					startDate = '';
					endDate = '';
					window.location.href = '/admin/financial';
				}}
				class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
			>
				Clear
			</button>
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => activeTab = 'overview'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Overview
			</button>
			<button
				on:click={() => activeTab = 'expenses'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'expenses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Expenses
			</button>
			<button
				on:click={() => activeTab = 'payments'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'payments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Payments
			</button>
			<button
				on:click={() => activeTab = 'statements'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'statements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Financial Statements
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

	<!-- Overview Tab -->
	{#if activeTab === 'overview'}
		<div class="space-y-6">
			<!-- Revenue vs Expenses -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Revenue vs Expenses</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div class="text-center p-6 bg-green-50 rounded-lg">
						<p class="text-sm text-gray-600 mb-2">Total Revenue</p>
						<p class="text-3xl font-bold text-green-600">Tk {data.revenueVsExpenses.revenue.toFixed(2)}</p>
					</div>
					<div class="text-center p-6 bg-red-50 rounded-lg">
						<p class="text-sm text-gray-600 mb-2">Total Expenses</p>
						<p class="text-3xl font-bold text-red-600">Tk {data.revenueVsExpenses.expenses.toFixed(2)}</p>
					</div>
					<div class="text-center p-6 bg-blue-50 rounded-lg">
						<p class="text-sm text-gray-600 mb-2">Net Profit</p>
						<p class="text-3xl font-bold {data.revenueVsExpenses.net >= 0 ? 'text-blue-600' : 'text-red-600'}">
							Tk {data.revenueVsExpenses.net.toFixed(2)}
						</p>
					</div>
				</div>
			</div>

			<!-- Payment Method Analytics -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Payment Method Analytics</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.paymentAnalytics as analytics}
								<tr>
									<td class="px-6 py-4 font-medium text-gray-900">{analytics.method}</td>
									<td class="px-6 py-4 text-gray-600">{analytics.count}</td>
									<td class="px-6 py-4 font-semibold text-gray-900">Tk {analytics.total.toFixed(2)}</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="px-6 py-8 text-center text-gray-500">No payment data available</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Failed Transactions -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Failed Payments</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.failedTransactions.slice(0, 10) as transaction}
								<tr>
									<td class="px-6 py-4 font-mono text-sm text-gray-900">{transaction.transaction_id || transaction.id?.slice(0, 8)}</td>
									<td class="px-6 py-4 text-gray-600">Tk {transaction.amount.toFixed(2)}</td>
									<td class="px-6 py-4 text-gray-600">{transaction.payment_method}</td>
									<td class="px-6 py-4 text-red-600">{transaction.failed_reason || 'Unknown'}</td>
									<td class="px-6 py-4 text-gray-600">
										{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="5" class="px-6 py-8 text-center text-gray-500">No failed transactions</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Expenses Tab -->
	{#if activeTab === 'expenses'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Expense Management</h2>
				<button
					on:click={() => {
						resetExpenseForm();
						showExpenseForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Add Expense
				</button>
			</div>

			{#if showExpenseForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{editingExpense ? 'Edit Expense' : 'Add New Expense'}
					</h3>
					<form method="POST" action={editingExpense ? '?/updateExpense' : '?/createExpense'} use:enhance>
						{#if editingExpense}
							<input type="hidden" name="id" value={editingExpense.id} />
						{/if}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="expense-category" class="block mb-2 font-medium">Category *</label>
								<input
									id="expense-category"
									type="text"
									name="category"
									bind:value={expenseCategory}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="e.g., Marketing, Operations"
								/>
							</div>
							<div>
								<label for="expense-amount" class="block mb-2 font-medium">Amount *</label>
								<input
									id="expense-amount"
									type="number"
									name="amount"
									bind:value={expenseAmount}
									required
									min="0"
									step="0.01"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div class="md:col-span-2">
								<label for="expense-description" class="block mb-2 font-medium">Description *</label>
								<input
									id="expense-description"
									type="text"
									name="description"
									bind:value={expenseDescription}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="expense-date" class="block mb-2 font-medium">Date *</label>
								<input
									id="expense-date"
									type="date"
									name="date"
									bind:value={expenseDate}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="expense-payment-method" class="block mb-2 font-medium">Payment Method</label>
								<input
									id="expense-payment-method"
									type="text"
									name="payment_method"
									bind:value={expensePaymentMethod}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
									placeholder="e.g., Bank Transfer, Cash"
								/>
							</div>
							<div>
								<label for="expense-receipt-url" class="block mb-2 font-medium">Receipt URL</label>
								<input
									id="expense-receipt-url"
									type="url"
									name="receipt_url"
									bind:value={expenseReceiptUrl}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div class="md:col-span-2">
								<label class="block mb-2 font-medium">Notes</label>
								<textarea
									name="notes"
									bind:value={expenseNotes}
									rows="3"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								></textarea>
							</div>
						</div>
						<div class="mt-6 flex gap-3">
							<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
								{editingExpense ? 'Update' : 'Create'} Expense
							</button>
							<button type="button" on:click={resetExpenseForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Expenses List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Expenses</h3>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.expenses as expense}
								<tr>
									<td class="px-6 py-4 text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
									<td class="px-6 py-4 font-medium text-gray-900">{expense.category}</td>
									<td class="px-6 py-4 text-gray-600">{expense.description}</td>
									<td class="px-6 py-4 font-semibold text-red-600">Tk {expense.amount.toFixed(2)}</td>
									<td class="px-6 py-4 text-gray-600">{expense.payment_method || 'N/A'}</td>
									<td class="px-6 py-4">
										<div class="flex gap-2">
											<button
												on:click={() => editExpense(expense)}
												class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
											>
												Edit
											</button>
											<form method="POST" action="?/deleteExpense" use:enhance class="inline">
												<input type="hidden" name="id" value={expense.id} />
												<button
													type="submit"
													class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
													on:click={(e) => {
														if (!confirm('Delete this expense?')) e.preventDefault();
													}}
												>
													Delete
												</button>
											</form>
										</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="px-6 py-8 text-center text-gray-500">No expenses found</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Payments Tab -->
	{#if activeTab === 'payments'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Payment Transactions</h2>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each data.transactions.slice(0, 50) as transaction}
							<tr>
								<td class="px-6 py-4 font-mono text-sm text-gray-900">{transaction.transaction_id || transaction.id?.slice(0, 8)}</td>
								<td class="px-6 py-4 text-gray-600">{transaction.order_id?.slice(0, 8) || 'N/A'}</td>
								<td class="px-6 py-4 font-semibold text-gray-900">Tk {transaction.amount.toFixed(2)}</td>
								<td class="px-6 py-4 text-gray-600">{transaction.payment_method}</td>
								<td class="px-6 py-4">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {
										transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
										transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
										transaction.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
										'bg-gray-100 text-gray-800'
									}">
										{transaction.status}
									</span>
								</td>
								<td class="px-6 py-4 text-gray-600">
									{transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-6 py-8 text-center text-gray-500">No transactions found</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- Financial Statements Tab -->
	{#if activeTab === 'statements'}
		<div class="space-y-6">
			{#if data.financialStatement}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h2 class="text-2xl font-bold text-gray-900 mb-4">Financial Statement</h2>
					<p class="text-gray-600 mb-6">Period: {data.financialStatement.period}</p>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<div class="p-6 bg-green-50 rounded-lg">
							<p class="text-sm text-gray-600 mb-2">Total Revenue</p>
							<p class="text-3xl font-bold text-green-600">Tk {data.financialStatement.total_revenue.toFixed(2)}</p>
						</div>
						<div class="p-6 bg-red-50 rounded-lg">
							<p class="text-sm text-gray-600 mb-2">Total Expenses</p>
							<p class="text-3xl font-bold text-red-600">Tk {data.financialStatement.total_expenses.toFixed(2)}</p>
						</div>
						<div class="p-6 bg-blue-50 rounded-lg">
							<p class="text-sm text-gray-600 mb-2">Net Profit</p>
							<p class="text-3xl font-bold text-blue-600">Tk {data.financialStatement.net_profit.toFixed(2)}</p>
						</div>
						<div class="p-6 bg-purple-50 rounded-lg">
							<p class="text-sm text-gray-600 mb-2">Tax Amount (15%)</p>
							<p class="text-3xl font-bold text-purple-600">Tk {data.financialStatement.tax_amount.toFixed(2)}</p>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 class="text-lg font-bold text-gray-900 mb-4">Revenue by Category</h3>
							<div class="space-y-2">
								{#each data.financialStatement.revenue_by_category as item}
									<div class="flex justify-between items-center p-3 bg-gray-50 rounded">
										<span class="text-gray-700">{item.category}</span>
										<span class="font-semibold text-gray-900">Tk {item.amount.toFixed(2)}</span>
									</div>
								{/each}
							</div>
						</div>
						<div>
							<h3 class="text-lg font-bold text-gray-900 mb-4">Expenses by Category</h3>
							<div class="space-y-2">
								{#each data.financialStatement.expenses_by_category as item}
									<div class="flex justify-between items-center p-3 bg-gray-50 rounded">
										<span class="text-gray-700">{item.category}</span>
										<span class="font-semibold text-gray-900">Tk {item.amount.toFixed(2)}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
					<p class="text-gray-700">Please select a date range above to generate a financial statement.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

