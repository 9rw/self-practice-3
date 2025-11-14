import { APIClient } from './apiClient.js';
import { loadingManager } from './loadingManager.js';

const API_URL = 'https://jsonplaceholder.typicode.com';
const output = document.getElementById('output');
const apiClient = new APIClient(API_URL);

function displayOutput(title, data, isError = false) {
  const className = isError ? 'error' : 'success';
  output.innerHTML = `
    <h3 class="${className}">${title}</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

export async function getUsers() {
  try {
    loadingManager.showLoading();
    const users = await apiClient.get('/users');
    displayOutput('GET Users (Success)', users);
  } catch (error) {
    displayOutput('GET Users (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function getUser1() {
  try {
    loadingManager.showLoading();
    const user = await apiClient.get('/users/1');
    displayOutput('GET User #1 (Success)', user);
  } catch (error) {
    displayOutput('GET User #1 (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function createPost() {
  try {
    loadingManager.showLoading();
    const newPost = {
      title: 'My First Post',
      body: 'This is the content of my post',
      userId: 1
    };
    
    const created = await apiClient.post('/posts', newPost);
    displayOutput('POST Create Post (Success)', created);
  } catch (error) {
    displayOutput('POST Create Post (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function updatePost() {
  try {
    loadingManager.showLoading();
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated content',
      userId: 1
    };
    
    const updated = await apiClient.put('/posts/1', updatedPost);
    displayOutput('PUT Update Post (Success)', updated);
  } catch (error) {
    displayOutput('PUT Update Post (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}

export async function deletePost() {
  try {
    loadingManager.showLoading();
    await apiClient.delete('/posts/1');
    displayOutput('DELETE Post (Success)', { 
      message: 'Post deleted successfully'
    });
  } catch (error) {
    displayOutput('DELETE Post (Error)', { message: error.message }, true);
  } finally {
    loadingManager.hideLoading();
  }
}
