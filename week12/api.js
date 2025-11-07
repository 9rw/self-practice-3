import { APIClient } from './apiClient.js';

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
    const users = await apiClient.get('/users');
    displayOutput('GET Users (Success)', users);
  } catch (error) {
    displayOutput('GET Users (Error)', { message: error.message }, true);
  }
}

export async function getUser1() {
  try {
    const user = await apiClient.get('/users/1');
    displayOutput('GET User #1 (Success)', user);
  } catch (error) {
    displayOutput('GET User #1 (Error)', { message: error.message }, true);
  }
}

export async function createPost() {
  try {
    const newPost = {
      title: 'My First Post',
      body: 'This is the content of my post',
      userId: 1
    };
    
    const created = await apiClient.post('/posts', newPost);
    displayOutput('POST Create Post (Success)', created);
  } catch (error) {
    displayOutput('POST Create Post (Error)', { message: error.message }, true);
  }
}

export async function updatePost() {
  try {
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
  }
}

export async function deletePost() {
  try {
    await apiClient.delete('/posts/1');
    displayOutput('DELETE Post (Success)', { 
      message: 'Post deleted successfully'
    });
  } catch (error) {
    displayOutput('DELETE Post (Error)', { message: error.message }, true);
  }
}
