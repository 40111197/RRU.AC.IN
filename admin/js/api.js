const API_BASE = 'http://localhost:3000/api';

// --- Client-side Mock Database Fallback for Static Environments (e.g. GitHub Pages) ---
async function getMockDB() {
  let dbStr = localStorage.getItem('rru_mock_db');
  if (!dbStr) {
    let dbUrl = 'db/db.json';
    const path = window.location.pathname;
    if (path.includes('/admin/') || path.includes('/public/')) {
      dbUrl = '../db/db.json';
    }
    try {
      const response = await fetch(dbUrl);
      const data = await response.json();
      localStorage.setItem('rru_mock_db', JSON.stringify(data));
      return data;
    } catch (e) {
      console.error('Failed to load initial mock DB', e);
      return {};
    }
  }
  return JSON.parse(dbStr);
}

function saveMockDB(db) {
  localStorage.setItem('rru_mock_db', JSON.stringify(db));
}

async function mockFetch(endpoint, options = {}) {
  const db = await getMockDB();
  const method = (options.method || 'GET').toUpperCase();
  const urlObj = new URL(endpoint, 'http://localhost'); // dummy base to parse endpoint path & query
  const pathname = urlObj.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[0];
  const id = parts[1];
  
  if (!db[resource]) {
    db[resource] = [];
  }
  
  if (method === 'GET') {
    let items = db[resource];
    if (id) {
      const item = items.find(x => String(x.id) === String(id));
      if (!item) throw new Error(`Not found: ${endpoint}`);
      return JSON.parse(JSON.stringify(item));
    }
    
    // Filter
    const queryParams = urlObj.searchParams;
    queryParams.forEach((value, key) => {
      if (key.startsWith('_')) return; // Skip _sort, _order, _limit
      items = items.filter(item => String(item[key]) === value);
    });
    
    // Sort
    const sort = queryParams.get('_sort');
    const order = queryParams.get('_order') || 'asc';
    if (sort) {
      items.sort((a, b) => {
        let valA = a[sort];
        let valB = b[sort];
        if (typeof valA === 'string') {
          return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return order === 'asc' ? valA - valB : valB - valA;
        }
      });
    }
    
    // Limit
    const limit = queryParams.get('_limit');
    if (limit) {
      items = items.slice(0, parseInt(limit, 10));
    }
    
    return JSON.parse(JSON.stringify(items));
  }
  
  if (method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    if (!body.id) {
      body.id = window.generateUUID ? window.generateUUID() : String(Date.now());
    }
    db[resource].push(body);
    saveMockDB(db);
    return JSON.parse(JSON.stringify(body));
  }
  
  if (method === 'PUT' || method === 'PATCH') {
    if (!id) throw new Error(`ID required for ${method}`);
    const body = JSON.parse(options.body || '{}');
    const idx = db[resource].findIndex(x => String(x.id) === String(id));
    if (idx === -1) throw new Error(`Not found: ${id}`);
    db[resource][idx] = { ...db[resource][idx], ...body };
    saveMockDB(db);
    return JSON.parse(JSON.stringify(db[resource][idx]));
  }
  
  if (method === 'DELETE') {
    if (!id) throw new Error(`ID required for DELETE`);
    const idx = db[resource].findIndex(x => String(x.id) === String(id));
    if (idx === -1) throw new Error(`Not found: ${id}`);
    const deleted = db[resource].splice(idx, 1);
    saveMockDB(db);
    return JSON.parse(JSON.stringify(deleted[0]));
  }
}

/**
 * Enhanced fetch wrapper with security headers and error handling
 * @param {string} endpoint 
 * @param {object} options 
 */
async function apiFetch(endpoint, options = {}) {
  // Check if we are running in a static external environment (like GitHub Pages)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost) {
    return mockFetch(endpoint, options);
  }

  const token = sessionStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Auto logout on unauthorized
      const isLoginPage = window.location.pathname.includes('admin/index.html') || window.location.pathname.endsWith('/admin') || window.location.pathname.endsWith('/admin/');
      if (!isLoginPage) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        
        let loginUrl = 'admin/index.html';
        const path = window.location.pathname;
        if (path.includes('/admin/') || path.endsWith('/admin')) {
          loginUrl = 'index.html';
        } else if (path.includes('/public/') || path.endsWith('/public')) {
          loginUrl = '../admin/index.html';
        }
        window.location.href = loginUrl;
      }
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
}


// Global API Object
window.api = {
  get: (endpoint) => apiFetch(endpoint),
  post: (endpoint, data) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint, data) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' })
};

/**
 * Input Sanitization (OWASP A03)
 */
window.sanitizeHTML = function(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str; // Use textContent to escape HTML
  return div.innerHTML;
};

/**
 * UUID Generator for new records (OWASP A08 style)
 */
window.generateUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

/**
 * Show Toast Notification
 */
window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
    color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Add styles for toast animation if not present
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.innerHTML = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);
}
