'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS = [
	{ url: 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/style.css', out: path.join('public', 'vendor', 'bytebellai', 'style.css') },
	{ url: 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/index.js', out: path.join('public', 'vendor', 'bytebellai', 'index.js') }
];

function download(url, outfile) {
	return new Promise((resolve, reject) => {
		const dir = path.dirname(outfile);
		fs.mkdirSync(dir, { recursive: true });
		const file = fs.createWriteStream(outfile);
		https
			.get(url, (res) => {
				if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
					// follow redirects
					return download(res.headers.location, outfile).then(resolve).catch(reject);
				}
				if (res.statusCode !== 200) {
					return reject(new Error(`Failed to download ${url}. Status: ${res.statusCode}`));
				}
				res.pipe(file);
				file.on('finish', () => file.close(() => resolve()));
			})
			.on('error', (err) => {
				fs.unlink(outfile, () => reject(err));
			});
	});
}

(async () => {
	try {
		for (const asset of ASSETS) {
			process.stdout.write(`Fetching ${asset.url} -> ${asset.out}\n`);
			await download(asset.url, asset.out);
		}
		process.stdout.write('Bytebell widget assets fetched successfully.\n');
		process.exit(0);
	} catch (err) {
		console.error('Failed to fetch Bytebell widget assets:', err);
		process.exit(1);
	}
})();
