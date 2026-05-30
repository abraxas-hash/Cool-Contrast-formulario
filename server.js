const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 8080;
const PUBLIC_DIR = process.cwd();

const server = http.createServer((req, res) => {
    // 1. Handle Webhook Proxy Relay
    if (req.method === 'POST' && (req.url === '/api/webhook' || req.url === '/api/generar-pdf')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(`Relaying payload for ${req.url} to n8n...`);
            
            let endpoints = [];
            if (req.url === '/api/webhook') {
                endpoints = [
                    'https://hvh-n8n.2ulbdq.easypanel.host/webhook/60652e5c-2f84-4c68-a994-2a499bff5c6f',
                    'https://hvh-n8n.2ulbdq.easypanel.host/webhook-test/60652e5c-2f84-4c68-a994-2a499bff5c6f'
                ];
            } else if (req.url === '/api/generar-pdf') {
                endpoints = [
                    'https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf',
                    'https://hvh-n8n.2ulbdq.easypanel.host/webhook-test/generar-pdf'
                ];
            }

            let completed = 0;
            let responses = [];
            let forwarded = false;

            endpoints.forEach(url => {
                const u = new URL(url);
                const options = {
                    hostname: u.hostname,
                    path: u.pathname,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(body)
                    }
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    let resBody = '';
                    proxyRes.on('data', c => resBody += c.toString());
                    proxyRes.on('end', () => {
                        console.log(`Relay response for ${url}: status ${proxyRes.statusCode}`);
                        responses.push({ url, status: proxyRes.statusCode, body: resBody });
                        completed++;

                        // If this endpoint succeeded (2xx) and we haven't forwarded a successful response yet, return it directly!
                        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300 && !forwarded) {
                            forwarded = true;
                            res.writeHead(proxyRes.statusCode, { 
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.end(resBody);
                            return;
                        }

                        if (completed === endpoints.length && !forwarded) {
                            // If all endpoints failed, send the combined response or error
                            res.writeHead(500, { 
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.end(JSON.stringify({ success: false, message: 'All endpoints failed or returned error', responses }));
                        }
                    });
                });

                proxyReq.on('error', (err) => {
                    console.error(`Relay error for ${url}:`, err.message);
                    responses.push({ url, status: 500, error: err.message });
                    completed++;
                    if (completed === endpoints.length && !forwarded) {
                        res.writeHead(500, { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(JSON.stringify({ success: false, message: 'Relay connection error', responses }));
                    }
                });

                proxyReq.write(body);
                proxyReq.end();
            });
        });
        return;
    }

    // 2. Handle Static Files Serving
    let reqUrl = req.url.split('?')[0]; // Strip query parameters
    
    if (reqUrl === '/' || reqUrl === '' || reqUrl === '/diagnostico') {
        reqUrl = '/tech-discovery-form.html';
    } else if (reqUrl === '/login') {
        reqUrl = '/login.html';
    } else if (reqUrl === '/dashboard') {
        reqUrl = '/dashboard.html';
    } else if (reqUrl === '/programas-fijos') {
        reqUrl = '/formulario-programas-fijos.html';
    } else if (reqUrl === '/tour-personalizado') {
        reqUrl = '/formulario-tour-personalizado.html';
    }

    let filePath = path.join(PUBLIC_DIR, reqUrl.startsWith('/') ? reqUrl.substring(1) : reqUrl);
    
    // Security check to prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (ext) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
        case '.json': contentType = 'application/json'; break;
        case '.ico': contentType = 'image/x-icon'; break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Symcron Local Dev Server & CORS Proxy listening on http://localhost:${PORT}`);
});
