#!/usr/bin/env node

/**
 * Development Server for GrowTogether UI
 * Serves canvas mockups, approved mockups, and components
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/workflows', express.static(path.join(__dirname, 'workflows')));

// Serve canvas mockups
app.use('/canvas', express.static(path.join(__dirname, '.superdesign/design_iterations')));

// Serve approved mockups
app.use('/mockups', express.static(path.join(__dirname, 'mockups')));

// Canvas index - list all staged mockups
app.get('/canvas', async (req, res) => {
  try {
    const canvasDir = path.join(__dirname, '.superdesign/design_iterations');
    
    // Ensure directory exists
    await fs.mkdir(canvasDir, { recursive: true });
    
    const files = await fs.readdir(canvasDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    
    const mockupsHTML = htmlFiles.map(file => {
      const name = file.replace('.html', '');
      return `
        <div class="mockup-item">
          <h3><a href="/canvas/${file}" target="_blank">${name}</a></h3>
          <div class="mockup-actions">
            <a href="/canvas/${file}" target="_blank">View</a>
            <a href="/canvas/${file}" download>Download</a>
          </div>
        </div>
      `;
    }).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Canvas - Staged Mockups</title>
        <link rel="stylesheet" href="/styles/main.css">
        <style>
            body { padding: 2rem; background: #f9fafb; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 3rem; }
            .mockup-item { 
                background: white; 
                padding: 1.5rem; 
                border-radius: 0.5rem; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                margin-bottom: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .mockup-actions a { 
                margin-left: 1rem; 
                color: #059669; 
                text-decoration: none; 
            }
            .mockup-actions a:hover { text-decoration: underline; }
            .no-mockups { 
                text-align: center; 
                padding: 3rem; 
                color: #6b7280; 
            }
            .create-button {
                background: #059669;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                text-decoration: none;
                display: inline-block;
                margin: 1rem 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 Canvas - Staged Mockups</h1>
                <p>Full-page mockup development environment</p>
            </div>
            
            ${htmlFiles.length > 0 ? `
                <h2>Staged Mockups (${htmlFiles.length})</h2>
                ${mockupsHTML}
            ` : `
                <div class="no-mockups">
                    <h2>No mockups staged</h2>
                    <p>Create your first mockup:</p>
                    <code>./canvas.sh stage my-mockup</code>
                </div>
            `}
            
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                <h3>Quick Actions</h3>
                <p><a href="/mockups/approved" class="create-button">View Approved Mockups</a></p>
                <p><code>./canvas.sh stage &lt;name&gt;</code> - Create new mockup</p>
                <p><code>./canvas.sh archive &lt;file&gt; &lt;name&gt;</code> - Archive approved mockup</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).send(`Error loading canvas: ${error.message}`);
  }
});

// Mockups index - list approved mockups
app.get('/mockups/approved', async (req, res) => {
  try {
    const approvedDir = path.join(__dirname, 'mockups/approved');
    
    // Ensure directory exists
    await fs.mkdir(approvedDir, { recursive: true });
    
    const files = await fs.readdir(approvedDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    
    const mockupsHTML = htmlFiles.map(file => {
      const name = file.replace('.html', '');
      const screenshotPath = `/mockups/screenshots/${name}.png`;
      return `
        <div class="approved-mockup">
          <div class="mockup-preview">
            <img src="${screenshotPath}" alt="${name}" onerror="this.style.display='none'">
          </div>
          <div class="mockup-info">
            <h3><a href="/mockups/approved/${file}" target="_blank">${name}</a></h3>
            <div class="mockup-actions">
              <a href="/mockups/approved/${file}" target="_blank">View</a>
              <a href="${screenshotPath}" target="_blank">Screenshot</a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Approved Mockups - Visual Reference</title>
        <link rel="stylesheet" href="/styles/main.css">
        <style>
            body { padding: 2rem; background: #f9fafb; }
            .container { max-width: 1000px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 3rem; }
            .approved-mockup { 
                background: white; 
                padding: 1.5rem; 
                border-radius: 0.5rem; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
                display: flex;
                gap: 1.5rem;
            }
            .mockup-preview img {
                width: 150px;
                height: auto;
                border-radius: 0.5rem;
                border: 1px solid #e5e7eb;
            }
            .mockup-info { flex: 1; }
            .mockup-actions a { 
                margin-right: 1rem; 
                color: #059669; 
                text-decoration: none; 
            }
            .mockup-actions a:hover { text-decoration: underline; }
            .no-mockups { 
                text-align: center; 
                padding: 3rem; 
                color: #6b7280; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📁 Approved Mockups</h1>
                <p>Visual reference for component development</p>
            </div>
            
            ${htmlFiles.length > 0 ? `
                <h2>Approved Mockups (${htmlFiles.length})</h2>
                ${mockupsHTML}
            ` : `
                <div class="no-mockups">
                    <h2>No approved mockups</h2>
                    <p>Archive your first approved mockup:</p>
                    <code>./canvas.sh archive mockup-name.html approved-name</code>
                </div>
            `}
            
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                <p><a href="/canvas">← Back to Canvas</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).send(`Error loading approved mockups: ${error.message}`);
  }
});

// Root - development dashboard
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GrowTogether UI - Development</title>
      <link rel="stylesheet" href="/styles/main.css">
      <style>
          body { padding: 2rem; background: #f9fafb; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 3rem; }
          .section { 
              background: white; 
              padding: 2rem; 
              border-radius: 0.75rem; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              margin-bottom: 2rem; 
          }
          .nav-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 1rem; 
              margin-top: 1rem; 
          }
          .nav-item { 
              background: #f3f4f6; 
              padding: 1rem; 
              border-radius: 0.5rem; 
              text-align: center; 
          }
          .nav-item a { 
              color: #059669; 
              text-decoration: none; 
              font-weight: 500; 
          }
          .nav-item a:hover { text-decoration: underline; }
          code { 
              background: #f3f4f6; 
              padding: 0.25rem 0.5rem; 
              border-radius: 0.25rem; 
              font-size: 0.875rem; 
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🌱 GrowTogether UI</h1>
              <p>Component Development Environment</p>
          </div>
          
          <div class="section">
              <h2>Development Areas</h2>
              <div class="nav-grid">
                  <div class="nav-item">
                      <a href="/canvas">🎨 Canvas</a>
                      <p>Stage mockups for development</p>
                  </div>
                  <div class="nav-item">
                      <a href="/mockups/approved">📁 Approved</a>
                      <p>Visual reference mockups</p>
                  </div>
                  <div class="nav-item">
                      <a href="/components">🔧 Components</a>
                      <p>Web component library</p>
                  </div>
                  <div class="nav-item">
                      <a href="/pages">📄 Pages</a>
                      <p>Page compositions</p>
                  </div>
              </div>
          </div>
          
          <div class="section">
              <h2>Quick Commands</h2>
              <ul>
                  <li><code>./canvas.sh stage mockup-name</code> - Create new mockup</li>
                  <li><code>./canvas.sh list</code> - List staged mockups</li>
                  <li><code>./canvas.sh archive mockup.html name</code> - Archive approved</li>
                  <li><code>npm run validate</code> - Check architecture</li>
                  <li><code>npm run test:visual</code> - Run visual tests</li>
              </ul>
          </div>
      </div>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 GrowTogether UI Development Server');
  console.log('=====================================');
  console.log('');
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🎨 Canvas mockups: http://localhost:${PORT}/canvas`);
  console.log(`📁 Approved mockups: http://localhost:${PORT}/mockups/approved`);
  console.log('');
  console.log('Press Ctrl+C to stop server');
});

export default app;