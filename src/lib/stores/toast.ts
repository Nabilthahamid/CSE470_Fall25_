// STORE: Toast notification system
import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number; // in milliseconds, defaults to 3000
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(toastData: Omit<Toast, 'id'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: Toast = {
			...toastData,
			id,
			duration: toastData.duration ?? 3000
		};
		
		update((toasts) => [...toasts, newToast]);
		
		// Auto remove after duration
		setTimeout(() => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		}, newToast.duration);
		
		return id;
	}

	function remove(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	function clear() {
		update(() => []);
	}

	return {
		subscribe,
		add,
		remove,
		clear,
		// Convenience methods
		success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
		error: (message: string, duration?: number) => add({ type: 'error', message, duration: duration ?? 5000 }),
		info: (message: string, duration?: number) => add({ type: 'info', message, duration }),
		warning: (message: string, duration?: number) => add({ type: 'warning', message, duration })
	};
}

export const toast = createToastStore();

