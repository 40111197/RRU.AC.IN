const API_BASE = 'http://localhost:3000/api';

/**
 * Enhanced fetch wrapper with security headers and error handling
 * @param {string} endpoint 
 * @param {object} options 
 */
async function apiFetch(endpoint, options = {}) {
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
      if (!window.location.pathname.includes('/admin/index.html')) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        window.location.href = '/admin/index.html';
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
