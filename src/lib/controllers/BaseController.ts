// CONTROLLER: Base controller class with common functionality
import type { RequestEvent } from '@sveltejs/kit';
import { handleError } from '$lib/utils/errors';

export class BaseController {
	protected event: RequestEvent;

	constructor(event: RequestEvent) {
		this.event = event;
	}

	/**
	 * Get the authenticated user from locals
	 */
	protected getUser() {
		return this.event.locals.user;
	}

	/**
	 * Get query parameters from URL
	 */
	protected getQueryParams() {
		return this.event.url.searchParams;
	}

	/**
	 * Get form data from request
	 */
	protected async getFormData() {
		return await this.event.request.formData();
	}

	/**
	 * Handle errors consistently
	 */
	protected handleError(error: unknown) {
		return handleError(error);
	}

	/**
	 * Get a query parameter value
	 */
	protected getQueryParam(key: string, defaultValue: string = ''): string {
		return this.event.url.searchParams.get(key) || defaultValue;
	}

	/**
	 * Get a query parameter as number
	 */
	protected getQueryParamAsNumber(key: string, defaultValue?: number): number | undefined {
		const value = this.event.url.searchParams.get(key);
		return value ? parseFloat(value) : defaultValue;
	}

	/**
	 * Get a query parameter as boolean
	 */
	protected getQueryParamAsBoolean(key: string, defaultValue: boolean = false): boolean {
		const value = this.event.url.searchParams.get(key);
		return value ? value === 'true' : defaultValue;
	}
}

