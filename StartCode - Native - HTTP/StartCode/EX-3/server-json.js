// server.js
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    console.log(`Received ${method} request for ${url}`);

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    if (url === '/contact' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <form method="POST" action="/contact">
            <input type="text" name="name" placeholder="Your name" />
            <button type="submit">Submit</button>
          </form>
        `);
        return;
    }

    if (url === '/contact' && method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const parsedData = new URLSearchParams(body);
            const name = parsedData.get('name');

            if (!name) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('Name field cannot be empty.');
            }

            console.log(`Received name: ${name}`);

            fs.readFile('submissions.json', 'utf8', (err, data) => {
                let submissions = [];
                if (!err && data) {
                    try {
                        submissions = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Error parsing JSON:', parseErr);
                    }
                }

                submissions.push({ name });

                fs.writeFile('submissions.json', JSON.stringify(submissions, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing to file:', writeErr);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Internal Server Error');
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                        <head><title>Thank You</title></head>
                        <body>
                          <h1>Thank you for your submission, ${name}!</h1>
                          <a href="/contact">Submit another name</a>
                        </body>
                      </html>
                    `);
                });
            });
        });

        return;
    }

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});