const jsonServer = require('json-server');
const path = require('path');
const express = require('express');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db/db.json'));
// Serve 'admin' folder at /admin - MOVE THIS ABOVE others
server.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve 'public' at root
server.use(express.static(path.join(__dirname, 'public')));

// Allow cross-origin requests
server.use(jsonServer.bodyParser);
server.use(jsonServer.defaults()); // No static here, already handled

// API Routes
server.use('/api', router); // Namespace API to avoid conflicts

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`RRU CMS Server is running on http://localhost:${PORT}`);
  console.log(`Public Site: http://localhost:${PORT}`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin`);
});
