import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Read the VITE_API_URL or BACKEND_URL from runtime env
const backendUrl = process.env.VITE_API_URL || process.env.BACKEND_URL;

if (backendUrl) {
  // Automatically strip any trailing '/api' from the backendUrl since we are proxying '/api'
  const target = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl;
  console.log(`Setting up proxy: /api -> ${target}`);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false, // Bypass SSL cert errors
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ 
          message: `RAILWAY PROXY ERROR: Could not connect to backend at ${target}. Details: ${err.message}` 
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        if (proxyRes.statusCode >= 400) {
          console.warn(`Backend returned error ${proxyRes.statusCode} for ${req.url}`);
        }
      }
    })
  );
} else {
  console.warn("WARNING: VITE_API_URL and BACKEND_URL are not set. API proxy will not work!");
  app.use('/api', (req, res) => {
    res.status(500).json({ 
      message: "CRITICAL ERROR: You must add the BACKEND_URL variable to your Railway Frontend Variables tab! The proxy has no idea where to send your data." 
    });
  });
}

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production Frontend Server running on port ${PORT}`);
});
