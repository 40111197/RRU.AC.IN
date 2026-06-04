// security.js - OWASP protection utilities

/**
 * Rate Limiting (Client Side - OWASP A04)
 */
function checkRateLimit(key, maxAttempts, windowMs) {
  const data = JSON.parse(sessionStorage.getItem(key) || `{"count":0,"start":${Date.now()}}`);
  const now = Date.now();
  
  if (now - data.start > windowMs) {
    data.count = 0; 
    data.start = now;
  }
  
  data.count++;
  sessionStorage.setItem(key, JSON.stringify(data));
  
  if (data.count > maxAttempts) {
    const waitSec = Math.ceil((windowMs - (now - data.start)) / 1000);
    return waitSec;
  }
  return 0;
}

/**
 * Magic Byte File Validation (OWASP A08)
 */
async function validateFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, WebP allowed');
  }
  if (file.size > maxSize) {
    throw new Error('File must be under 5MB');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      const header = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // JPEG: ffd8ffe0, ffd8ffe1... PNG: 89504e47, WebP: 52494646
      const validHeaders = ['ffd8ff', '89504e', '524946'];
      const isValid = validHeaders.some(h => header.startsWith(h));
      
      if (!isValid) {
        reject(new Error('Invalid file content detected (Magic byte mismatch)'));
      }
      resolve(true);
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

/**
 * Audit Logging Utility (OWASP A09)
 */
async function logAudit(action, tableName, recordId, oldData, newData) {
  const user = window.auth.getLoggedInUser();
  if (!user) return;

  try {
    await window.api.post('/audit_logs', {
      id: window.generateUUID(),
      user_id: user.id,
      username: user.username,
      action, // CREATE | UPDATE | DELETE
      table_name: tableName,
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Audit log failed', e);
  }
}

/**
 * URL Validation (OWASP A10)
 */
function validateURL(url) {
  try {
    const parsed = new URL(url);
    const allowed = ['rru.ac.in', 'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com'];
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return allowed.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

// Export to window
window.security = {
  checkRateLimit,
  validateFile,
  logAudit,
  validateURL
};
