export class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 10000;
    this.maxRetries = options.maxRetries || 2;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.enableLogging = options.enableLogging || false;
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 60000; // Default 60 seconds
    this.enableCache = options.enableCache !== false;
  }

  // Cache management
  getCacheKey(url, options) {
    return `${options.method || 'GET'}:${url}`;
  }

  getFromCache(key) {
    if (!this.enableCache) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data) {
    if (!this.enableCache) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    if (this.enableLogging) {
      console.log('[Cache] Cache cleared');
    }
  }

  invalidateCache(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
    if (this.enableLogging) {
      console.log(`[Cache] Invalidated cache for pattern: ${pattern}`);
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        expiresIn: this.cacheTTL - (Date.now() - value.timestamp)
      }))
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Apply request interceptors
  async applyRequestInterceptors(url, options) {
    let modifiedOptions = { ...options };
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(url, modifiedOptions);
      if (result) modifiedOptions = result;
    }
    return modifiedOptions;
  }

  // Apply response interceptors
  async applyResponseInterceptors(response, data) {
    let modifiedData = data;
    for (const interceptor of this.responseInterceptors) {
      const result = await interceptor(response, modifiedData);
      if (result !== undefined) modifiedData = result;
    }
    return modifiedData;
  }

  // Fetch with timeout
  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  // Retry logic
  async requestWithRetry(url, options, retries = 0) {
    try {
      return await this.fetchWithTimeout(url, options);
    } catch (error) {
      if (retries < this.maxRetries) {
        if (this.enableLogging) {
          console.log(`Retry attempt ${retries + 1}/${this.maxRetries}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return this.requestWithRetry(url, options, retries + 1);
      }
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(url, options);
    const method = options.method || 'GET';

    try {
      // Check cache for GET requests
      if (method === 'GET' && !options.forceRefresh) {
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
          if (this.enableLogging) {
            console.log(`[Cache HIT] ${url}`);
          }
          return { ...cachedData, fromCache: true };
        }
        if (this.enableLogging) {
          console.log(`[Cache MISS] ${url}`);
        }
      }

      // Apply request interceptors
      const modifiedOptions = await this.applyRequestInterceptors(url, options);

      // Log request
      if (this.enableLogging) {
        console.log(`[Request] ${modifiedOptions.method || 'GET'} ${url}`, modifiedOptions);
      }

      // Make request with retry
      const response = await this.requestWithRetry(url, modifiedOptions);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      let data = await response.json();

      // Apply response interceptors
      data = await this.applyResponseInterceptors(response, data);

      // Cache GET requests
      if (method === 'GET') {
        this.setCache(cacheKey, data);
      }

      // Invalidate cache for mutating operations
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        this.invalidateCache(endpoint.split('/')[1] || endpoint);
      }

      // Log response
      if (this.enableLogging) {
        const duration = Date.now() - startTime;
        console.log(`[Response] ${response.status} ${url} (${duration}ms)`, data);
      }

      return { ...data, fromCache: false };
    } catch (error) {
      if (this.enableLogging) {
        const duration = Date.now() - startTime;
        console.error(`[Error] ${url} (${duration}ms)`, error.message);
      }
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}
