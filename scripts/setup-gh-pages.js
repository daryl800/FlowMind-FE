const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

// Ensure dist folder exists
if (!fs.existsSync(distPath)) {
    console.error('dist folder does not exist. Run npm run build:web first.');
    process.exit(1);
}

// Create 404.html for SPA routing
const html404 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FlowMind</title>
  <script>
    // Store the original path before redirect
    sessionStorage.redirect = location.pathname + location.search;
  </script>
  <meta http-equiv="refresh" content="0;URL='/FlowMind-FE/index.html'">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .message {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="message">
    <h1>Loading FlowMind...</h1>
    <p>Redirecting to the app.</p>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(distPath, '404.html'), html404);

// Create .nojekyll to prevent Jekyll processing
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');

console.log('✅ GitHub Pages setup complete!');
console.log('📁 Created:');
console.log('   - 404.html (SPA fallback)');
console.log('   - .nojekyll (disable Jekyll)');