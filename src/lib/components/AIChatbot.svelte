<!-- AI Chatbot Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let userId: string | null = null;

	let isOpen = false;
	let messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [];
	let inputMessage = '';
	let isLoading = false;
	let chatContainer: HTMLDivElement;

	onMount(() => {
		// Add welcome message
		messages = [
			{
				role: 'assistant',
				content: 'Hello! I\'m your AI assistant at TinyTech. I can help you with:\n\n• Product questions and recommendations\n• Order status inquiries\n• General shopping assistance\n\nHow can I help you today?',
				timestamp: new Date()
			}
		];
	});

	function toggleChat() {
		isOpen = !isOpen;
		if (isOpen && chatContainer) {
			// Scroll to bottom when opening
			setTimeout(() => {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 100);
		}
	}

	async function sendMessage() {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage = inputMessage.trim();
		inputMessage = '';
		
		// Add user message
		messages = [...messages, { role: 'user', content: userMessage, timestamp: new Date() }];
		
		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 50);

		isLoading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: userMessage,
					userId: userId,
					conversationHistory: messages.slice(0, -1).map(m => ({
						role: m.role,
						content: m.content
					}))
				})
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const data = await response.json();
			
			// Add assistant response
			messages = [...messages, { 
				role: 'assistant', 
				content: data.response, 
				timestamp: new Date() 
			}];

			// Scroll to bottom after response
			setTimeout(() => {
				if (chatContainer) {
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			}, 50);
		} catch (error) {
			console.error('Chat error:', error);
			messages = [...messages, {
				role: 'assistant',
				content: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
				timestamp: new Date()
			}];
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function formatTime(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function formatMessage(content: string): Array<{ type: 'text' | 'link' | 'bold'; content: string }> {
		const parts: Array<{ type: 'text' | 'link' | 'bold'; content: string }> = [];
		let remaining = content;

		// Process links first (format: /products/{id})
		const linkRegex = /(\/products\/[a-zA-Z0-9-]+)/g;
		let lastIndex = 0;
		let match;

		while ((match = linkRegex.exec(remaining)) !== null) {
			// Add text before link
			if (match.index > lastIndex) {
				const textBefore = remaining.substring(lastIndex, match.index);
				// Process bold in text before
				parts.push(...processBold(textBefore));
			}
			// Add link
			parts.push({ type: 'link', content: match[0] });
			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < remaining.length) {
			const textAfter = remaining.substring(lastIndex);
			parts.push(...processBold(textAfter));
		}

		// If no links found, just process bold
		if (parts.length === 0) {
			parts.push(...processBold(content));
		}

		return parts;
	}

	function processBold(text: string): Array<{ type: 'text' | 'link' | 'bold'; content: string }> {
		const parts: Array<{ type: 'text' | 'link' | 'bold'; content: string }> = [];
		const boldRegex = /\*\*(.*?)\*\*/g;
		let lastIndex = 0;
		let match;

		while ((match = boldRegex.exec(text)) !== null) {
			// Add text before bold
			if (match.index > lastIndex) {
				parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
			}
			// Add bold text
			parts.push({ type: 'bold', content: match[1] });
			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < text.length) {
			parts.push({ type: 'text', content: text.substring(lastIndex) });
		}

		// If no bold found, return as text
		if (parts.length === 0) {
			parts.push({ type: 'text', content: text });
		}

		return parts;
	}
</script>

<!-- Chat Button -->
<button
	type="button"
	on:click={toggleChat}
	class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all z-50 flex items-center justify-center group hover:scale-110 transform duration-300"
	aria-label="Open AI Chatbot"
	aria-expanded={isOpen}
>
	<div class="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-75 animate-ping"></div>
	<div class="relative z-10">
		{#if isOpen}
			<svg class="w-7 h-7 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		{:else}
			<svg class="w-7 h-7 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
			</svg>
			<span class="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg"></span>
		{/if}
	</div>
</button>

<!-- Chat Window -->
{#if isOpen}
	<div
		class="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-indigo-200 animate-slide-up"
		role="dialog"
		aria-modal="true"
		aria-labelledby="chat-title"
	>
		<!-- Header -->
		<div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between shadow-lg">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-white bg-opacity-25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
					</svg>
				</div>
				<div>
					<h3 id="chat-title" class="font-bold text-base">AI Assistant</h3>
					<div class="flex items-center gap-2 mt-0.5">
						<span class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
						<p class="text-xs text-indigo-100 font-medium">Online • 24/7 Support</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Messages -->
		<div
			bind:this={chatContainer}
			class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
		>
			{#each messages as message (message.timestamp.getTime())}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in">
					<div
						class="max-w-[80%] rounded-xl px-4 py-3 shadow-md {message.role === 'user'
							? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
							: 'bg-white text-gray-800 border-2 border-gray-200'}"
					>
						{#if message.role === 'assistant'}
							<div class="text-sm whitespace-pre-wrap break-words">
								{#each formatMessage(message.content) as part}
									{#if part.type === 'link'}
										<a href={part.content} class="text-indigo-600 hover:text-indigo-800 underline font-semibold">{part.content}</a>
									{:else if part.type === 'bold'}
										<strong>{part.content}</strong>
									{:else}
										{part.content}
									{/if}
								{/each}
							</div>
						{:else}
							<p class="text-sm whitespace-pre-wrap break-words">{message.content}</p>
						{/if}
						<p class="text-xs mt-1 opacity-70">
							{formatTime(message.timestamp)}
						</p>
					</div>
				</div>
			{/each}

			{#if isLoading}
				<div class="flex justify-start">
					<div class="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
						<div class="flex gap-1">
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input -->
		<div class="border-t-2 border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={inputMessage}
					on:keypress={handleKeyPress}
					placeholder="Ask me anything..."
					disabled={isLoading}
					class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
				/>
				<button
					type="button"
					on:click={sendMessage}
					disabled={!inputMessage.trim() || isLoading}
					class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}
	
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
	
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>
