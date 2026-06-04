// auth.js - JWT & Role based access control

const SECRET_KEY = 'rru_puducherry_security_secret_2024'; // In a real app, this wouldn't be on the client

/**
 * Create a mock JWT (OWASP A07)
 */
function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  // Set expiry to 15 minutes (900,000 ms)
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 900000 }));
  const signature = CryptoJS.HmacSHA256(`${header}.${body}`, SECRET_KEY).toString();
  return `${header}.${body}.${signature}`;
}

/**
 * Verify JWT (OWASP A07)
 */
function verifyToken(token) {
  if (!token) return null;
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;
    
    const expected = CryptoJS.HmacSHA256(`${header}.${body}`, SECRET_KEY).toString();
    if (sig !== expected) {
      console.warn('Invalid token signature');
      return null;
    }
    
    const payload = JSON.parse(atob(body));
    if (payload.exp < Date.now()) {
      console.warn('Token expired');
      return null;
    }
    
    return payload;
  } catch (e) {
    console.error('Token verification error', e);
    return null;
  }
}

/**
 * Get currently logged in user
 */
function getLoggedInUser() {
  const token = sessionStorage.getItem('auth_token');
  return verifyToken(token);
}

/**
 * Role Guard (OWASP A01)
 */
function checkAccess(requiredRole = 'editor') {
  const user = getLoggedInUser();
  if (!user) {
    let loginUrl = 'admin/index.html';
    const path = window.location.pathname;
    if (path.includes('/admin/') || path.endsWith('/admin')) {
      loginUrl = 'index.html';
    } else if (path.includes('/public/') || path.endsWith('/public')) {
      loginUrl = '../admin/index.html';
    }
    window.location.href = loginUrl;
    return false;
  }
  
  const roleLevels = { 'editor': 1, 'admin': 2, 'superadmin': 3 };
  const userLevel = roleLevels[user.role] || 0;
  const requiredLevel = roleLevels[requiredRole] || 1;
  
  if (userLevel < requiredLevel) {
    alert('Access Denied: You do not have permission to view this page.');
    let dashboardUrl = 'admin/dashboard.html';
    const path = window.location.pathname;
    if (path.includes('/admin/') || path.endsWith('/admin')) {
      dashboardUrl = 'dashboard.html';
    } else if (path.includes('/public/') || path.endsWith('/public')) {
      dashboardUrl = '../admin/dashboard.html';
    }
    window.location.href = dashboardUrl;
    return false;
  }
  
  return true;
}

/**
 * Logout
 */
function logout() {
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

// Export to window
window.auth = {
  createToken,
  verifyToken,
  getLoggedInUser,
  checkAccess,
  logout
};

// Auto-logout on inactivity (15 mins)
let activityTimeout;
function resetTimer() {
  clearTimeout(activityTimeout);
  activityTimeout = setTimeout(() => {
    if (getLoggedInUser()) {
      alert('Session expired due to inactivity.');
      logout();
    }
  }, 900000); // 15 mins
}

window.addEventListener('mousemove', resetTimer);
window.addEventListener('keydown', resetTimer);
resetTimer();
