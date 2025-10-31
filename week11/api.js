const API_URL = 'https://jsonplaceholder.typicode.com';
const output = document.getElementById('output');

function displayOutput(title, data, isError = false) {
  const className = isError ? 'error' : 'success';
  output.innerHTML = `
    <h3 class="${className}">${title}</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

export async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const users = await response.json();
    displayOutput('GET Users (Success)', users);
    
  } catch (error) {
    displayOutput('GET Users (Error)', { message: error.message }, true);
  }
}

export async function getUser1() {
  try {
    const response = await fetch(`${API_URL}/users/1`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const user = await response.json();
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
    
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const created = await response.json();
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
    
    const response = await fetch(`${API_URL}/posts/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPost)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const updated = await response.json();
    displayOutput('PUT Update Post (Success)', updated);
    
  } catch (error) {
    displayOutput('PUT Update Post (Error)', { message: error.message }, true);
  }
}

export async function deletePost() {
  try {
    const response = await fetch(`${API_URL}/posts/1`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    displayOutput('DELETE Post (Success)', { 
      message: 'Post deleted successfully',
      status: response.status 
    });
    
  } catch (error) {
    displayOutput('DELETE Post (Error)', { message: error.message }, true);
  }
}
