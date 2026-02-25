export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = `${import.meta.env.VITE_API_GATEWAY_URL}`) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestInit,
    redir: Boolean = true,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      ...options,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const responsetext = await response.text();
    const responseData = responsetext?JSON.parse(responsetext):{} as T;

    if (!response.ok) {
      if (response.status === 401 && redir) window.location.href = "/login";
      const errorMessage = responseData?.message || responseData?.error || response.statusText;
      throw new Error(errorMessage);
    }

    return responseData;
  }

  async get<T>(
    endpoint: string,
    options?: RequestInit,
    redir?: Boolean
  ): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options, redir);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
    redir?: Boolean
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, options, redir);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
    redir?: Boolean
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options, redir);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
    redir?: Boolean
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options, redir);
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit,
    redir?: Boolean
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options, redir);
  }
}

export const api = new ApiClient();
