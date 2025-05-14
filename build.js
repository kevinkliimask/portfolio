const fs = require('fs');
const path = require('path');

const routes = ['experience'];

// Create dist directory if it doesn't exist
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Copy all static assets to dist
const staticAssets = [
  'favicon.ico',
  'index.html',
  'index.js',
  'stars.css',
  'window-controls.js',
];

// Copy assets folder
const assetsPath = path.join(distPath, 'assets');
if (!fs.existsSync(assetsPath)) {
  fs.mkdirSync(assetsPath, { recursive: true });
}
fs.readdirSync(path.join(__dirname, 'assets')).forEach(file => {
  fs.copyFileSync(
    path.join(__dirname, 'assets', file),
    path.join(assetsPath, file)
  );
});

// Copy static files
staticAssets.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(
      path.join(__dirname, file),
      path.join(distPath, file)
    );
  }
});

// Read the original index.html
const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Create route directories and files
routes.forEach(route => {
  const routePath = path.join(distPath, route);
  
  if (!fs.existsSync(routePath)) {
    fs.mkdirSync(routePath, { recursive: true });
  }

  // Create index.html with adjusted paths
  let routeContent = indexContent.replace(/href="(?!http|\/\/|mailto:)(.*?)"/g, 'href="../$1"')
                                .replace(/src="(?!http|\/\/)(.*?)"/g, 'src="../$1"')
                                .replace(/url\((.*?)\)/g, 'url(../$1)');

  // Inject script to auto-select the correct tab
  const scriptToInject = `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Find and click the ${route} tab
        const tabButton = document.querySelector('button[aria-controls="${route}"]');
        if (tabButton) {
          tabButton.click();
          tabButton.setAttribute('aria-selected', 'true');
          
          // Deselect other tabs
          document.querySelectorAll('button[role="tab"]').forEach(btn => {
            if (btn.getAttribute('aria-controls') !== '${route}') {
              btn.setAttribute('aria-selected', 'false');
            }
          });
          
          // Show the correct panel
          document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
            if (panel.id === '${route}') {
              panel.removeAttribute('hidden');
            } else {
              panel.setAttribute('hidden', true);
            }
          });
        }
      });
    </script>
  `;

  routeContent = routeContent.replace('</body>', `${scriptToInject}\n</body>`);

  fs.writeFileSync(path.join(routePath, 'index.html'), routeContent);
});
