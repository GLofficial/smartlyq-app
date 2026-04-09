import { ENDPOINTS, STORAGE_KEYS } from "./constants";
import type { ApiError } from "./types";

class ApiClient {
	private baseUrl = "";
	private refreshPromise: Promise<boolean> | null = null;

	private getToken(): string | null {
		return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
	}

	private setToken(token: string): void {
		localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
	}

	private clearToken(): void {
		localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
	}

	private async buildHeaders(options?: RequestInit): Promise<Headers> {
		const headers = new Headers(options?.headers);
		if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
			headers.set("Content-Type", "application/json");
		}
		headers.set("Accept", "application/json");

		const token = this.getToken();
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}

		return headers;
	}

	async fetch<T>(url: string, options?: RequestInit): Promise<T> {
		const headers = await this.buildHeaders(options);

		const response = await fetch(`${this.baseUrl}${url}`, {
			...options,
			headers,
			credentials: "include",
		});

		if (response.status === 401) {
			const refreshed = await this.tryRefreshToken();
			if (refreshed) {
				const retryHeaders = await this.buildHeaders(options);
				const retryResponse = await fetch(`${this.baseUrl}${url}`, {
					...options,
					headers: retryHeaders,
					credentials: "include",
				});
				if (!retryResponse.ok) {
					throw await this.parseError(retryResponse);
				}
				return retryResponse.json();
			}
			this.clearToken();
			// Use base URL so we stay within the React app (not the PHP app)
			const base = import.meta.env.BASE_URL || "/";
			window.location.href = `${base}login`;
			throw new Error("Session expired");
		}

		if (!response.ok) {
			throw await this.parseError(response);
		}

		return response.json();
	}

	async get<T>(url: string): Promise<T> {
		return this.fetch<T>(url, { method: "GET" });
	}

	async post<T>(url: string, body?: unknown): Promise<T> {
		return this.fetch<T>(url, {
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async put<T>(url: string, body?: unknown): Promise<T> {
		return this.fetch<T>(url, {
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async del<T>(url: string): Promise<T> {
		return this.fetch<T>(url, { method: "DELETE" });
	}

	async upload<T>(url: string, formData: FormData): Promise<T> {
		return this.fetch<T>(url, {
			method: "POST",
			body: formData,
		});
	}

	login(token: string): void {
		this.setToken(token);
	}

	logout(): void {
		this.clearToken();
	}

	isAuthenticated(): boolean {
		return !!this.getToken();
	}

	private async tryRefreshToken(): Promise<boolean> {
		if (this.refreshPromise) return this.refreshPromise;
		this.refreshPromise = this.doRefreshToken();
		try {
			return await this.refreshPromise;
		} finally {
			this.refreshPromise = null;
		}
	}

	private async doRefreshToken(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}${ENDPOINTS.TOKEN_REFRESH}`, {
				method: "POST",
				credentials: "include",
				headers: { Accept: "application/json" },
			});
			if (!response.ok) return false;
			const data = await response.json();
			if (data.access_token) {
				this.setToken(data.access_token);
				return true;
			}
			return false;
		} catch {
			return false;
		}
	}

	private async parseError(response: Response): Promise<ApiError> {
		try {
			return await response.json();
		} catch {
			return { message: `Request failed with status ${response.status}` };
		}
	}
}

export const apiClient = new ApiClient();
