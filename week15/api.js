import { APIClient } from './apiClient.js';
import { loadingManager } from './loadingManager.js';

const API_URL = 'https://jsonplaceholder.typicode.com';
const output = document.getElementById('output');
const requestLog = document.getElementById('request-log');
const cacheStatus = document.getElementById('cache-status');

// Initialize API client with caching enabled
const apiClient = new APIClient(API_URL, {
  timeout: 10000,
  maxRetries: 2,
  enableLogging: true,
  enableCache: true,
  cacheTTL: 30000 // 30 seconds
});

// Add request interceptor to add timestamp
apiClient.addRequestInterceptor((url, options) => {
  options.headers = {
    ...options.headers,
    'X-Request-Time': new Date().toISOString()
  };
  return options;
});

// Add response interceptor to add metadata
apiClient.addResponseInterceptor((response, data) => {
  return {
    data,
    metadata: {
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString()
    }
  };
});

function displayOutput(title, data, isError = false) {
  const className = isError ? 'error' : 'success';
  const cacheIndicator = data.fromCache ? ' <span class="cache-badge">📦 From Cache</span>' : ' <span class="cache-badge fresh">🔄 Fresh Data</span>';
  output.innerHTML = `
    <h3 class="${className}">${title}${!isError ? cacheIndicator : ''}</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
  updateCacheStatus();
}

function addRequestLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type}`;
  logEntry.textContent = `[${timestamp}] ${message}`;
  requestLog.insertBefore(logEntry, requestLog.firstChild);
  
  // Keep only last 10 logs
  while (requestLog.children.length > 10) {
    requestLog.removeChild(requestLog.lastChild);
  }
}

function updateCacheStatus() {
  const stats = apiClient.getCacheStats();
  cacheStatus.innerHTML = `
    <strong>Cache Entries:</strong> ${stats.size}<br>
    ${stats.entries.map(e => `
      <small>${e.key} - expires in ${Math.round(e.expiresIn / 1000)}s</small>
    `).join('<br>')}
  `;
}

export function clearCache() {
  apiClient.clearCache();
  addRequestLog('Cache cleared', 'info');
  updateCacheStatus();
  output.innerHTML = '<h3>Cache cleared successfully</h3>';
}

export async function getUsers() {
  try {
    loadingManager.showLoading();
    addRequestLog('Fetching all users...', 'info');
    const users = await apiClient.get('/users');
    const cacheMsg = users.fromCache ? ' (from cache)' : ' (fresh)';
    addRequestLog('Successfully fetched all users' + cacheMsg, 'success');
    displayOutput('GET Users (Success)', users);
  } catch (error) {
    addRequestLog(`Error fetching users: ${error.message}`, 'error');
    displayOutput('GET Users (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function getUser1() {
  try {
    loadingManager.showLoading();
    addRequestLog('Fetching user #1...', 'info');
    const user = await apiClient.get('/users/1');
    const cacheMsg = user.fromCache ? ' (from cache)' : ' (fresh)';
    addRequestLog('Successfully fetched user #1' + cacheMsg, 'success');
    displayOutput('GET User #1 (Success)', user);
  } catch (error) {
    addRequestLog(`Error fetching user: ${error.message}`, 'error');
    displayOutput('GET User #1 (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function createPost() {
  try {
    loadingManager.showLoading();
    addRequestLog('Creating new post...', 'info');
    const newPost = {
      title: 'My First Post',
      body: 'This is the content of my post',
      userId: 1
    };
    
    const created = await apiClient.post('/posts', newPost);
    addRequestLog('Successfully created post', 'success');
    displayOutput('POST Create Post (Success)', created);
  } catch (error) {
    addRequestLog(`Error creating post: ${error.message}`, 'error');
    displayOutput('POST Create Post (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function updatePost() {
  try {
    loadingManager.showLoading();
    addRequestLog('Updating post #1...', 'info');
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated content',
      userId: 1
    };
    
    const updated = await apiClient.put('/posts/1', updatedPost);
    addRequestLog('Successfully updated post', 'success');
    displayOutput('PUT Update Post (Success)', updated);
  } catch (error) {
    addRequestLog(`Error updating post: ${error.message}`, 'error');
    displayOutput('PUT Update Post (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function deletePost() {
  try {
    loadingManager.showLoading();
    addRequestLog('Deleting post #1...', 'info');
    await apiClient.delete('/posts/1');
    addRequestLog('Successfully deleted post', 'success');
    displayOutput('DELETE Post (Success)', { 
      message: 'Post deleted successfully'
    });
  } catch (error) {
    addRequestLog(`Error deleting post: ${error.message}`, 'error');
    displayOutput('DELETE Post (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}
