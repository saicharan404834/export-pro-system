// Use relative path to enable Vite dev server proxy
const API_BASE_URL = '/api';

export class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    console.debug(`[ApiService] Request: GET ${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      // prevent cached 304 responses without body
      cache: 'no-store',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

  const json = await response.json();
  console.debug(`[ApiService] Response from ${API_BASE_URL}${url}:`, json);

    // Normalize common backend envelope { status/success, data, pagination }
    if (json && typeof json === 'object') {
      const hasData = Object.prototype.hasOwnProperty.call(json, 'data');
      const isEnveloped = hasData || Object.prototype.hasOwnProperty.call(json, 'status') || Object.prototype.hasOwnProperty.call(json, 'success');
      if (hasData && isEnveloped) {
        return (json.data ?? json) as T;
      }
    }

    return json as T;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url);
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(url: string): Promise<void> {
    return this.request<void>(url, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();