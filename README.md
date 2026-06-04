# RRU Puducherry CMS (Vanilla Stack)

A secure, modular CMS for Rashtriya Raksha University – Puducherry Campus, built with Vanilla HTML5, CSS3, and JavaScript.

## Features
- **Public Website**: Matching RRU design with dynamic slides, news, events, and gallery.
- **Admin Dashboard**: Secure management portal with Role-Based Access Control (RBAC).
- **Security First**: Implementation of OWASP Top 10 measures in pure JavaScript.
- **Mock Backend**: Uses `json-server` for a RESTful experience with no complex DB setup required for dev.

## OWASP Security Implementation
| Vulnerability | Implementation |
| :--- | :--- |
| **A01 Broken Access Control** | `admin/js/auth.js` - Role level guards on every page. |
| **A02 Crypto Failures** | Password hashing (SHA256) via CryptoJS; session-based JWT storage. |
| **A03 Injection** | `admin/js/api.js` - Global HTML sanitization using DOM escaping. |
| **A04 Insecure Design** | `admin/js/security.js` - Login rate limiting in sessionStorage. |
| **A05 Security Config** | HTTP-equiv meta tags for CSP, X-Frame-Options, etc. |
| **A07 Auth Failures** | Pure JS JWT implementation with 15m expiry and signature verification. |
| **A08 File Integrity** | Magic byte validation for image uploads (JPEG/PNG/WebP). |
| **A09 Logging** | `audit_logs` and `login_history` tables tracking every admin action. |
| **A10 SSRF**| Setting Manager validates external URLs against an allowlist. |

## Role Permissions
- **Superadmin**: Full access (Logs, User Management, Site Settings).
- **Admin**: CRUD on all content (News, Events, Hero, Gallery).
- **Editor**: View all content, Read/Update only (No delete, No system logs).

## Requirements
- Node.js (for `json-server`)

## Setup Instructions
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the mock server**:
   ```bash
   npm start
   ```
3. **Open the website**:
   Open `public/index.html` in your browser.
4. **Admin Access**:
   Go to `/admin/index.html` or click the "⚙ Edit Site" button if logged in.
   - **User**: `admin@rru.ac.in`
   - **Password**: `Admin@123`

## File Structure
- `/public/`: Frontend for the public website.
- `/admin/`: Dashboard UI and management pages.
- `/db/`: Data storage (`db.json`).
- `admin/js/api.js`: Centralized fetch wrapper with sanitization.
- `admin/js/auth.js`: JWT and Authorization logic.
- `admin/js/security.js`: Security utility functions.
