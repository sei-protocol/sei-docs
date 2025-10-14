'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const terser = require('terser');

const BYTEBELLAI_JS_URL = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/index.js';
const BYTEBELLAI_JS_OUT = path.join('src', 'vendor', 'bytebellai', 'index.js');
const BYTEBELLAI_CSS_URL = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/style.css';
const BYTEBELLAI_CSS_OUT = path.join('src', 'vendor', 'bytebellai', 'style.css');

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
		process.stdout.write(`Fetching ${BYTEBELLAI_CSS_URL} -> ${BYTEBELLAI_CSS_OUT}\n`);
		await download(BYTEBELLAI_CSS_URL, BYTEBELLAI_CSS_OUT);
		process.stdout.write('Bytebell widget CSS fetched successfully.\n');

		process.stdout.write(`Fetching ${BYTEBELLAI_JS_URL} -> ${BYTEBELLAI_JS_OUT}\n`);
		await download(BYTEBELLAI_JS_URL, BYTEBELLAI_JS_OUT);
		// Minify the widget JS after download to further reduce bundle size
		try {
			const code = fs.readFileSync(BYTEBELLAI_JS_OUT, 'utf8');
			const result = await terser.minify(code, {
				ecma: 2024,
				keep_fnames: false,
				keep_classnames: false,
				compress: {
					defaults: true,
					toplevel: true,
					passes: 7,
					drop_console: true,
					drop_debugger: true,
					sequences: true,
					dead_code: true,
					conditionals: true,
					comparisons: true,
					booleans: true,
					if_return: true,
					join_vars: true,
					evaluate: true,
					inline: 3,
					pure_getters: true,
					reduce_funcs: true,
					reduce_vars: true,
					keep_fargs: false,
					unsafe: true,
					unsafe_arrows: true,
					unsafe_comps: true,
					unsafe_methods: true,
					unsafe_symbols: true,
					unsafe_undefined: true
				},
				mangle: {
					toplevel: true,
					keep_fnames: false,
					keep_classnames: false
				},
				format: {
					comments: false,
					ascii_only: true
				}
			});
			if (result.code) {
				fs.writeFileSync(BYTEBELLAI_JS_OUT, result.code);
				process.stdout.write('Minified Bytebell widget script.\n');
			}
		} catch (e) {
			process.stderr.write(`Warning: failed to minify Bytebell widget: ${e?.message || e}\n`);
		}
		process.stdout.write('Bytebell widget script fetched successfully.\n');
		process.exit(0);
	} catch (err) {
		console.error('Failed to fetch Bytebell widget assets:', err);
		process.exit(1);
	}
})();
