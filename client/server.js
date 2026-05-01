import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Read the VITE_API_URL or BACKEND_URL from runtime env
const backendUrl = process.env.VITE_API_URL || process.env.BACKEND_URL || 'http://localhost:5001';

// Serve static files from the React build (except index.html)
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// Handle React Router fallback and inject runtime variables
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('Error reading index.html', err);
      return res.status(500).send('Error loading frontend');
    }
    
    // Inject the real BACKEND_URL into the HTML
    const injectedHtml = htmlData.replace(
      '"__BACKEND_URL_PLACEHOLDER__"', 
      `"${backendUrl}"`
    );
    
    res.send(injectedHtml);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production Frontend Server running on port ${PORT}`);
  console.log(`💉 Injected BACKEND_URL: ${backendUrl}`);
});
