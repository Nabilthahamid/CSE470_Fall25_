<!-- VIEW: Email Marketing Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let activeTab = data.activeTab || 'newsletters';
	let showNewsletterForm = false;
	let showSequenceForm = false;
	let startDate = data.startDate || '';
	let endDate = data.endDate || '';

	// Newsletter form
	let newsletterName = '';
	let newsletterSubject = '';
	let newsletterContent = '';
	let newsletterContentType: 'html' | 'text' = 'html';
	let recipientType: 'all' | 'subscribers' | 'customers' | 'segment' = 'all';
	let recipientSegment = '';
	let scheduledAt = '';

	// Sequence form
	let sequenceName = '';
	let sequenceTrigger: 'welcome' | 'abandoned_cart' | 'order_confirmation' | 'order_shipped' | 'custom' = 'welcome';
	let sequenceTriggerDelay = 0;
	let sequenceEmails: Array<{ order: number; subject: string; content: string; content_type: 'html' | 'text'; delay_hours: number }> = [];
	let sequenceIsActive = true;

	function addSequenceEmail() {
		sequenceEmails.push({
			order: sequenceEmails.length + 1,
			subject: '',
			content: '',
			content_type: 'html',
			delay_hours: 24
		});
	}

	function removeSequenceEmail(index: number) {
		sequenceEmails.splice(index, 1);
		sequenceEmails.forEach((email, i) => {
			email.order = i + 1;
		});
	}

	function resetNewsletterForm() {
		newsletterName = '';
		newsletterSubject = '';
		newsletterContent = '';
		newsletterContentType = 'html';
		recipientType = 'all';
		recipientSegment = '';
		scheduledAt = '';
		showNewsletterForm = false;
	}

	function resetSequenceForm() {
		sequenceName = '';
		sequenceTrigger = 'welcome';
		sequenceTriggerDelay = 0;
		sequenceEmails = [];
		sequenceIsActive = true;
		showSequenceForm = false;
	}

	function applyDateFilter() {
		const params = new URLSearchParams();
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		params.set('tab', activeTab);
		window.location.href = `/admin/marketing/email?${params.toString()}`;
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'draft':
				return 'bg-gray-100 text-gray-800';
			case 'scheduled':
				return 'bg-yellow-100 text-yellow-800';
			case 'sending':
				return 'bg-blue-100 text-blue-800';
			case 'sent':
				return 'bg-green-100 text-green-800';
			case 'failed':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Email Marketing - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Email Marketing</h1>

	<!-- Date Filter -->
	<div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label for="email-start-date" class="block mb-2 text-sm font-medium">Start Date</label>
				<input
					id="email-start-date"
					type="date"
					bind:value={startDate}
					class="p-2 border-2 border-gray-300 rounded-lg"
				/>
			</div>
			<div>
				<label for="email-end-date" class="block mb-2 text-sm font-medium">End Date</label>
				<input
					id="email-end-date"
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
					window.location.href = '/admin/marketing/email';
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
				on:click={() => activeTab = 'newsletters'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'newsletters' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Newsletters
			</button>
			<button
				on:click={() => activeTab = 'sequences'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {activeTab === 'sequences' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Email Sequences
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

	<!-- Newsletters Tab -->
	{#if activeTab === 'newsletters'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Newsletters</h2>
				<button
					on:click={() => {
						resetNewsletterForm();
						showNewsletterForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Create Newsletter
				</button>
			</div>

			{#if showNewsletterForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Create Newsletter</h3>
					<form method="POST" action="?/createNewsletter" use:enhance>
						<div class="space-y-4">
							<div>
								<label for="newsletter-name" class="block mb-2 font-medium">Name *</label>
								<input
									id="newsletter-name"
									type="text"
									name="name"
									bind:value={newsletterName}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="newsletter-subject" class="block mb-2 font-medium">Subject *</label>
								<input
									id="newsletter-subject"
									type="text"
									name="subject"
									bind:value={newsletterSubject}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="newsletter-content-type" class="block mb-2 font-medium">Content Type</label>
								<select id="newsletter-content-type" name="content_type" bind:value={newsletterContentType} class="w-full p-3 border-2 border-gray-300 rounded-lg">
									<option value="html">HTML</option>
									<option value="text">Plain Text</option>
								</select>
							</div>
							<div>
								<label for="newsletter-content" class="block mb-2 font-medium">Content *</label>
								<textarea
									id="newsletter-content"
									name="content"
									bind:value={newsletterContent}
									required
									rows="10"
									class="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm"
								></textarea>
							</div>
							<div>
								<label for="newsletter-recipient-type" class="block mb-2 font-medium">Recipient Type</label>
								<select id="newsletter-recipient-type" name="recipient_type" bind:value={recipientType} class="w-full p-3 border-2 border-gray-300 rounded-lg">
									<option value="all">All Users</option>
									<option value="subscribers">Subscribers Only</option>
									<option value="customers">Customers Only</option>
									<option value="segment">Custom Segment</option>
								</select>
							</div>
							{#if recipientType === 'segment'}
								<div>
									<label for="newsletter-segment" class="block mb-2 font-medium">Segment Criteria</label>
									<input
										id="newsletter-segment"
										type="text"
										name="recipient_segment"
										bind:value={recipientSegment}
										class="w-full p-3 border-2 border-gray-300 rounded-lg"
										placeholder="e.g., role=admin, created_at>2024-01-01"
									/>
								</div>
							{/if}
							<div>
								<label class="block mb-2 font-medium">Schedule (optional)</label>
								<input
									type="datetime-local"
									name="scheduled_at"
									bind:value={scheduledAt}
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div class="flex gap-3">
								<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
									Create Newsletter
								</button>
								<button type="button" on:click={resetNewsletterForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
									Cancel
								</button>
							</div>
						</div>
					</form>
				</div>
			{/if}

			<!-- Newsletters List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Newsletters</h3>
				<div class="space-y-4">
					{#each data.newsletters as newsletter}
						<div class="p-4 border border-gray-200 rounded-lg">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h4 class="font-semibold text-gray-900 mb-1">{newsletter.name}</h4>
									<p class="text-sm text-gray-600 mb-2">Subject: {newsletter.subject}</p>
									<div class="flex items-center gap-4 text-sm text-gray-500">
										<span>Recipients: {newsletter.recipient_type}</span>
										<span>Opened: {newsletter.opened_count}</span>
										<span>Clicked: {newsletter.clicked_count}</span>
										{#if newsletter.scheduled_at}
											<span>Scheduled: {new Date(newsletter.scheduled_at).toLocaleString()}</span>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(newsletter.status)}">
										{newsletter.status}
									</span>
									<form method="POST" action="?/deleteNewsletter" use:enhance class="inline">
										<input type="hidden" name="id" value={newsletter.id} />
										<button
											type="submit"
											class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
											on:click={(e) => {
												if (!confirm('Delete this newsletter?')) e.preventDefault();
											}}
										>
											Delete
										</button>
									</form>
								</div>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-8">No newsletters found. Create your first newsletter!</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Email Sequences Tab -->
	{#if activeTab === 'sequences'}
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-2xl font-bold text-gray-900">Email Sequences</h2>
				<button
					on:click={() => {
						resetSequenceForm();
						showSequenceForm = true;
					}}
					class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
				>
					+ Create Sequence
				</button>
			</div>

			{#if showSequenceForm}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Create Email Sequence</h3>
					<form method="POST" action="?/createSequence" use:enhance>
						<div class="space-y-4">
							<div>
								<label for="sequence-name" class="block mb-2 font-medium">Sequence Name *</label>
								<input
									id="sequence-name"
									type="text"
									name="name"
									bind:value={sequenceName}
									required
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label for="sequence-trigger" class="block mb-2 font-medium">Trigger *</label>
								<select id="sequence-trigger" name="trigger" bind:value={sequenceTrigger} class="w-full p-3 border-2 border-gray-300 rounded-lg">
									<option value="welcome">Welcome (New User)</option>
									<option value="abandoned_cart">Abandoned Cart</option>
									<option value="order_confirmation">Order Confirmation</option>
									<option value="order_shipped">Order Shipped</option>
									<option value="custom">Custom</option>
								</select>
							</div>
							<div>
								<label for="sequence-trigger-delay" class="block mb-2 font-medium">Trigger Delay (hours)</label>
								<input
									id="sequence-trigger-delay"
									type="number"
									name="trigger_delay"
									bind:value={sequenceTriggerDelay}
									min="0"
									class="w-full p-3 border-2 border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<div class="block mb-2 font-medium">Emails in Sequence</div>
								{#each sequenceEmails as email, index}
									<div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
										<div class="flex justify-between items-center mb-2">
											<span class="font-medium">Email #{email.order}</span>
											<button
												type="button"
												on:click={() => removeSequenceEmail(index)}
												class="px-2 py-1 bg-red-600 text-white rounded text-sm"
											>
												Remove
											</button>
										</div>
										<div class="space-y-2">
											<input
												type="text"
												bind:value={email.subject}
												placeholder="Subject"
												class="w-full p-2 border border-gray-300 rounded"
											/>
											<textarea
												bind:value={email.content}
												rows="3"
												placeholder="Email content"
												class="w-full p-2 border border-gray-300 rounded"
											></textarea>
											<input
												type="number"
												bind:value={email.delay_hours}
												placeholder="Delay (hours)"
												min="0"
												class="w-full p-2 border border-gray-300 rounded"
											/>
										</div>
									</div>
								{/each}
								<button
									type="button"
									on:click={addSequenceEmail}
									class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									+ Add Email
								</button>
							</div>
							<div>
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										name="is_active"
										bind:checked={sequenceIsActive}
										class="w-4 h-4"
									/>
									<span>Active</span>
								</label>
							</div>
							<input type="hidden" name="emails" value={JSON.stringify(sequenceEmails)} />
							<div class="flex gap-3">
								<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
									Create Sequence
								</button>
								<button type="button" on:click={resetSequenceForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
									Cancel
								</button>
							</div>
						</div>
					</form>
				</div>
			{/if}

			<!-- Sequences List -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h3 class="text-xl font-bold text-gray-900 mb-4">All Sequences</h3>
				<div class="space-y-4">
					{#each data.sequences as sequence}
						<div class="p-4 border border-gray-200 rounded-lg">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h4 class="font-semibold text-gray-900 mb-1">{sequence.name}</h4>
									<p class="text-sm text-gray-600 mb-2">Trigger: {sequence.trigger.replace('_', ' ')}</p>
									<p class="text-sm text-gray-600">Emails: {sequence.emails?.length || 0}</p>
								</div>
								<div class="flex items-center gap-2">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {sequence.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
										{sequence.is_active ? 'Active' : 'Inactive'}
									</span>
									<form method="POST" action="?/deleteSequence" use:enhance class="inline">
										<input type="hidden" name="id" value={sequence.id} />
										<button
											type="submit"
											class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
											on:click={(e) => {
												if (!confirm('Delete this sequence?')) e.preventDefault();
											}}
										>
											Delete
										</button>
									</form>
								</div>
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-center py-8">No sequences found. Create your first sequence!</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Analytics Tab -->
	{#if activeTab === 'analytics'}
		<div class="space-y-6">
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Total Sent</h3>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.totalSent}</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Open Rate</h3>
					<p class="text-3xl font-bold text-indigo-600">{data.analytics.openRate.toFixed(2)}%</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Click Rate</h3>
					<p class="text-3xl font-bold text-green-600">{data.analytics.clickRate.toFixed(2)}%</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h3 class="text-sm font-semibold text-gray-600 mb-2">Bounce Rate</h3>
					<p class="text-3xl font-bold text-red-600">{data.analytics.bounceRate.toFixed(2)}%</p>
				</div>
			</div>

			<!-- Campaign Performance -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Campaign Performance</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Rate</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.analytics.byCampaign as campaign}
								<tr>
									<td class="px-6 py-4 font-medium text-gray-900">{campaign.campaign}</td>
									<td class="px-6 py-4 text-gray-600">{campaign.sent}</td>
									<td class="px-6 py-4 text-gray-600">{campaign.opened}</td>
									<td class="px-6 py-4 text-gray-600">{campaign.clicked}</td>
									<td class="px-6 py-4 text-gray-600">{campaign.openRate.toFixed(2)}%</td>
									<td class="px-6 py-4 text-gray-600">{campaign.clickRate.toFixed(2)}%</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="px-6 py-8 text-center text-gray-500">No campaign data</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>

