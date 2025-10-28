const fs = require('fs').promises;
const path = require('path');

/**
 * Main function to scrape documentation directly from MDX files and their JS/TS imports
 */
async function scrapeDocsRendered() {
	const contentDir = './content';
	const srcDir = './src';
	const outputPath = './public/_scraped-docs';
	const scrapedPages = [];

	try {
		console.log('🚀 Starting direct documentation scraping...');
		await fs.mkdir(outputPath, { recursive: true });

		// Get all MDX files from content directory
		const mdxFiles = await findMdxFiles(contentDir);
		console.log(`📋 Found ${mdxFiles.length} MDX files`);

		// Process each MDX file
		for (let i = 0; i < mdxFiles.length; i++) {
			const filePath = mdxFiles[i];
			console.log(`➡️ (${i + 1}/${mdxFiles.length}) Processing: ${filePath}`);

			try {
				const pageData = await processMdxFile(filePath, srcDir);
				if (pageData) {
					scrapedPages.push(pageData);
					console.log(`   ✅ Done (${pageData.content.length} chars)`);
					if (pageData.imports && pageData.imports.length > 0) {
						console.log(`   📦 Imports: ${pageData.imports.length} found`);
					}
				}
			} catch (error) {
				console.warn(`   ❌ Error processing ${filePath}:`, error.message);
			}
		}

		console.log(`✅ Processed ${scrapedPages.length} pages`);
		await saveScrapedContent(scrapedPages, outputPath);
	} catch (err) {
		console.error('❌ Fatal error:', err);
		process.exit(1);
	}
}

/**
 * Recursively find all MDX files in a directory
 */
async function findMdxFiles(dir, basePath = '') {
	const files = [];
	const items = await fs.readdir(dir);

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = await fs.stat(fullPath);

		if (stat.isDirectory() && !item.startsWith('_') && !item.startsWith('.')) {
			const subFiles = await findMdxFiles(fullPath, path.join(basePath, item));
			files.push(...subFiles);
		} else if (item.endsWith('.mdx')) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Process a single MDX file and its imports
 */
async function processMdxFile(filePath, srcDir) {
	try {
		const content = await fs.readFile(filePath, 'utf8');

		// Extract frontmatter
		const metadata = extractFrontmatter(content);

		// Extract imports
		const imports = extractImports(content);

		// Get imported content
		const importedContent = await getImportedContent(imports, srcDir, filePath);

		// Clean MDX content (remove frontmatter and imports)
		const cleanContent = cleanMdxContent(content);

		// Generate URL from file path
		const url = generateUrlFromPath(filePath);

		// Combine content
		const combinedContent = combineContent(cleanContent, importedContent);

		if (combinedContent.length < 50) {
			return null; // Skip very short content
		}

		return {
			url: `https://docs.sei.io${url}`,
			title: metadata?.title || extractTitleFromContent(cleanContent) || path.basename(filePath, '.mdx'),
			description: metadata?.description || null,
			keywords: metadata?.keywords || null,
			content: combinedContent,
			filePath: filePath,
			imports: Object.keys(importedContent)
		};
	} catch (error) {
		console.warn(`Could not process ${filePath}:`, error.message);
		return null;
	}
}

/**
 * Extract frontmatter from MDX content
 */
function extractFrontmatter(content) {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return null;

	const frontmatterContent = frontmatterMatch[1];
	const metadata = {};

	// Simple YAML parsing
	const lines = frontmatterContent.split('\n');
	let currentKey = null;
	let inArray = false;

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;

		if (trimmedLine.startsWith('- ')) {
			if (inArray && currentKey) {
				if (!metadata[currentKey]) metadata[currentKey] = [];
				metadata[currentKey].push(trimmedLine.slice(2).replace(/['"]/g, ''));
			}
		} else if (trimmedLine.includes(':')) {
			const [key, ...valueParts] = trimmedLine.split(':');
			currentKey = key.trim();
			const value = valueParts.join(':').trim();

			if (value === '' || value === '[') {
				inArray = true;
				metadata[currentKey] = [];
			} else {
				inArray = false;
				if (value.startsWith('[') && value.endsWith(']')) {
					const items = value
						.slice(1, -1)
						.split(',')
						.map((item) => item.trim().replace(/['"]/g, ''));
					metadata[currentKey] = items;
				} else {
					metadata[currentKey] = value.replace(/['"]/g, '');
				}
			}
		}
	}

	return metadata;
}

/**
 * Extract import statements from MDX content
 */
function extractImports(content) {
	const imports = {};
	const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"];?/g;

	let match;
	while ((match = importRegex.exec(content)) !== null) {
		const [, namedImports, namespaceImport, defaultImport, importPath] = match;

		// Process both relative and absolute imports that start with src
		if (importPath.startsWith('.') || importPath.startsWith('/') || importPath.includes('src/')) {
			imports[importPath] = {
				namedImports: namedImports ? namedImports.split(',').map((s) => s.trim()) : [],
				namespaceImport: namespaceImport || null,
				defaultImport: defaultImport || null
			};
		}
	}

	return imports;
}

/**
 * Get content from imported files
 */
async function getImportedContent(imports, srcDir, mdxFilePath) {
	const importedContent = {};

	for (const [importPath, importInfo] of Object.entries(imports)) {
		try {
			// Resolve the actual file path
			const resolvedPath = await resolveImportPath(importPath, srcDir, mdxFilePath);
			if (!resolvedPath) {
				continue;
			}

			const fileContent = await fs.readFile(resolvedPath, 'utf8');
			const extractedContent = extractContentFromJsTs(fileContent, importInfo, resolvedPath);

			if (extractedContent) {
				importedContent[importPath] = extractedContent;
			}
		} catch (error) {
			// Silent fail for imports that can't be resolved
		}
	}

	return importedContent;
}

/**
 * Resolve import path to actual file system path
 */
async function resolveImportPath(importPath, srcDir, mdxFilePath) {
	let resolvedPath;

	if (importPath.startsWith('./') || importPath.startsWith('../')) {
		// Relative import - resolve from the MDX file's directory
		const mdxDir = path.dirname(mdxFilePath);
		resolvedPath = path.resolve(mdxDir, importPath);
	} else if (importPath.startsWith('/')) {
		// Absolute import from root
		resolvedPath = path.resolve('.', importPath.slice(1));
	} else if (importPath.includes('src/')) {
		// Import that includes src path
		resolvedPath = path.resolve('.', importPath);
	} else {
		// Module import - likely in src directory
		resolvedPath = path.resolve(srcDir, importPath);
	}

	// Try different extensions, including JSON first for data files
	const extensions = ['.json', '.tsx', '.ts', '.jsx', '.js'];

	for (const ext of extensions) {
		try {
			const pathWithExt = resolvedPath + ext;
			await fs.access(pathWithExt);
			return pathWithExt;
		} catch {}
	}

	// Try index files
	for (const ext of extensions) {
		try {
			const indexPath = path.join(resolvedPath, `index${ext}`);
			await fs.access(indexPath);
			return indexPath;
		} catch {}
	}

	return null;
}

/**
 * Extract meaningful content from JS/TS files
 */
function extractContentFromJsTs(fileContent, importInfo, filePath) {
	let extractedContent = '';

	// Extract comments (JSDoc, regular comments)
	const commentRegex = /\/\*\*([\s\S]*?)\*\/|\/\*([\s\S]*?)\*\/|\/\/(.*)$/gm;
	let match;
	while ((match = commentRegex.exec(fileContent)) !== null) {
		if (match[1]) {
			// JSDoc comment
			const docComment = match[1].replace(/\s*\*\s?/g, ' ').trim();
			if (docComment.length > 10) {
				extractedContent += docComment + '\n';
			}
		} else if (match[2]) {
			// Block comment
			const blockComment = match[2].trim();
			if (blockComment.length > 10) {
				extractedContent += blockComment + '\n';
			}
		} else if (match[3]) {
			// Line comment
			const lineComment = match[3].trim();
			if (lineComment.length > 10) {
				extractedContent += lineComment + '\n';
			}
		}
	}

	// Extract data arrays and objects (especially useful for component data)
	const dataArrayRegex = /(?:const|export\s+const)\s+(\w*(?:data|config|endpoints|options|items|list)\w*)\s*[:=]\s*\[[\s\S]*?\];?/gi;
	while ((match = dataArrayRegex.exec(fileContent)) !== null) {
		const dataName = match[1];
		let dataContent = match[0];
		// Extract meaningful data from arrays
		if (dataContent.includes('url') || dataContent.includes('endpoint') || dataContent.includes('provider') || dataContent.includes('network')) {
			// Extract URLs and endpoints
			const urlMatches = dataContent.match(/['"`](https?:\/\/[^'"`]+)['"`]/g);
			if (urlMatches) {
				extractedContent += `${dataName} endpoints: ${urlMatches.map((u) => u.replace(/['"`]/g, '')).join(', ')}\n`;
			}

			// Extract providers
			const providerMatches = dataContent.match(/provider\s*:\s*['"`]([^'"`]+)['"`]/g);
			if (providerMatches) {
				extractedContent += `${dataName} providers: ${providerMatches.map((p) => p.replace(/provider\s*:\s*['"`]([^'"`]+)['"`]/, '$1')).join(', ')}\n`;
			}

			// Extract descriptions
			const descMatches = dataContent.match(/description\s*:\s*['"`]([^'"`]+)['"`]/g);
			if (descMatches) {
				extractedContent += `${dataName} descriptions: ${descMatches.map((d) => d.replace(/description\s*:\s*['"`]([^'"`]+)['"`]/, '$1')).join('; ')}\n`;
			}
		}
	}

	// Extract string literals that look like documentation
	const stringRegex = /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
	while ((match = stringRegex.exec(fileContent)) !== null) {
		const str = match[2];
		if (
			str.length > 30 &&
			(str.includes(' ') || str.includes('.')) &&
			(str.includes('description') ||
				str.includes('title') ||
				str.includes('text') ||
				str.includes('Official') ||
				str.includes('Community') ||
				str.includes('endpoint'))
		) {
			extractedContent += str + '\n';
		}
	}

	// Extract type definitions and interfaces
	const typeRegex = /(?:interface|type|enum)\s+(\w+)[\s\S]*?(?=\n(?:interface|type|enum|export|const|function)|$)/g;
	while ((match = typeRegex.exec(fileContent)) !== null) {
		const typeDef = match[0];
		if (typeDef.includes('RpcEndpoint') || typeDef.includes('Network') || typeDef.includes('Config') || typeDef.includes('Data')) {
			extractedContent += `Type definition: ${typeDef.substring(0, 300)}${typeDef.length > 300 ? '...' : ''}\n`;
		}
	}

	// Extract const declarations that might contain configuration
	const constRegex = /export\s+const\s+(\w+)[\s\S]*?(?=\nexport|\nconst|\nfunction|$)/g;
	while ((match = constRegex.exec(fileContent)) !== null) {
		const constContent = match[0];
		if (
			constContent.includes('config') ||
			constContent.includes('data') ||
			constContent.includes('options') ||
			constContent.includes('endpoint') ||
			constContent.includes('network') ||
			constContent.includes('chain')
		) {
			extractedContent += `Configuration/Data: ${constContent.substring(0, 500)}${constContent.length > 500 ? '...' : ''}\n`;
		}
	}

	// For JSON files, extract relevant data
	if (filePath.endsWith('.json')) {
		try {
			const jsonData = JSON.parse(fileContent);
			if (typeof jsonData === 'object') {
				// Extract first level keys and some structure info
				const structure = Object.keys(jsonData).slice(0, 20).join(', ');
				extractedContent += `JSON data structure (keys): ${structure}\n`;

				// If it's a small JSON, include more content
				if (fileContent.length < 2000) {
					extractedContent += `JSON content: ${JSON.stringify(jsonData, null, 2)}\n`;
				} else {
					// For larger JSON, extract key-value pairs that look like documentation
					const jsonStr = JSON.stringify(jsonData, null, 2);
					const docKeys = ['title', 'description', 'name', 'url', 'endpoint', 'network', 'chain'];
					docKeys.forEach((key) => {
						const keyRegex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'gi');
						let keyMatch;
						while ((keyMatch = keyRegex.exec(jsonStr)) !== null) {
							extractedContent += `${key}: ${keyMatch[1]}\n`;
						}
					});
				}
			}
		} catch {}
	}

	return extractedContent.trim();
}

/**
 * Clean MDX content by removing frontmatter, imports, and JSX/HTML markup
 */
function cleanMdxContent(content) {
	// Remove frontmatter
	let cleaned = content.replace(/^---\n[\s\S]*?\n---\n?/, '');

	// Remove import statements
	cleaned = cleaned.replace(/import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"][^'"]+['"];?\n?/g, '');

	// Remove JSX/HTML comments
	cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
	cleaned = cleaned.replace(/{\/\*[\s\S]*?\*\/}/g, '');

	// Replace common components with their text equivalents
	cleaned = replaceComponentsWithText(cleaned);

	// Clean HTML/JSX tags but preserve structure and content
	cleaned = cleanHtmlJsxTags(cleaned);

	return cleaned.trim();
}

/**
 * Replace common components with their text equivalents
 */
function replaceComponentsWithText(content) {
	// Replace RpcSelector with actual RPC endpoint information
	content = content.replace(
		/<RpcSelector\s*\/?>/,
		`
**Available RPC Endpoints:**

**Mainnet:**
- https://evm-rpc.sei-apis.com (Sei Foundation - Recommended for development, Rate limit: 10 req/s)
- https://evm-rpc-sei.stingray.plus (Staketab Community RPC)
- https://sei-evm-rpc.publicnode.com (PublicNode Community RPC, Rate limit: 5 req/s)
- https://seievm-rpc.polkachu.com (Polkachu Community RPC)
- https://jsonrpc.lavenderfive.com:443/sei (LavenderFive Community RPC)

**Testnet (atlantic-2):**
- https://evm-rpc-testnet.sei-apis.com (Sei Foundation - Recommended for testing, Rate limit: 20 req/s)
- https://evm-rpc-testnet-sei.stingray.plus (Staketab Community RPC)
- https://seievm-testnet-rpc.polkachu.com (Polkachu Community RPC)
- https://sei-testnet.drpc.org (dRPC Community RPC)


**Local Development:**
- http://localhost:8545 (Local Node - For local development only)
`
	);

	// Replace other common components
	content = content.replace(/<AddSeiInlineButton\s*\/?>/, 'Add Sei Network to Wallet (interactive button)');
	content = content.replace(/<NetworkTabs\s*\/?>/, 'Network selection tabs for different Sei networks');
	content = content.replace(/<ChainInformation\s*\/?>/, 'Chain information display component');
	content = content.replace(/<FaucetRequest\s*\/?>/, 'Faucet request form component');

	// Replace icon components with text descriptions
	content = content.replace(/<Icon(\w+)[^>]*\/?>|<Icon(\w+)[^>]*>[\s\S]*?<\/Icon(\w+)>/g, (match, iconName1, iconName2) => {
		const iconName = iconName1 || iconName2;
		const iconDescriptions = {
			Rocket: '🚀',
			ArrowRight: '→',
			ChevronRight: '›',
			Check: '✓',
			Copy: '📋',
			ExternalLink: '🔗',
			Search: '🔍',
			Server: '🖥️',
			Terminal2: '💻',
			Package: '📦',
			Wand: '🪄',
			LayoutDashboard: '📊',
			Tools: '🔧',
			InfoCircle: 'ℹ️'
		};
		return iconDescriptions[iconName] || `[${iconName} icon]`;
	});

	return content;
}

/**
 * Clean HTML/JSX tags while preserving content structure
 */
function cleanHtmlJsxTags(content) {
	// Remove complex className and style attributes first
	content = content.replace(/\s+className\s*=\s*["'][^"']*["']/g, '');
	content = content.replace(/\s+style\s*=\s*{[^}]*}/g, '');

	// Remove common wrapper divs and containers that don't add semantic meaning
	content = content.replace(/<div[^>]*>\s*<div[^>]*>/g, '');
	content = content.replace(/<\/div>\s*<\/div>/g, '');
	content = content.replace(/<div[^>]*>\s*$/gm, '');
	content = content.replace(/^\s*<\/div>/gm, '');

	// Convert semantic HTML to markdown equivalents
	content = content.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, (_, level, text) => {
		return '#'.repeat(parseInt(level)) + ' ' + text.trim();
	});

	// Convert links to markdown
	content = content.replace(/<a\s+href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/g, '[$2]($1)');

	// Convert basic formatting
	content = content.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
	content = content.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
	content = content.replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`');

	// Handle tables
	content = content.replace(/<table[^>]*>/g, '\n');
	content = content.replace(/<\/table>/g, '\n');
	content = content.replace(/<thead[^>]*>/g, '');
	content = content.replace(/<\/thead>/g, '');
	content = content.replace(/<tbody[^>]*>/g, '');
	content = content.replace(/<\/tbody>/g, '');
	content = content.replace(/<tr[^>]*>/g, '| ');
	content = content.replace(/<\/tr>/g, ' |\n');
	content = content.replace(/<th[^>]*>(.*?)<\/th>/g, '$1 | ');
	content = content.replace(/<td[^>]*>(.*?)<\/td>/g, '$1 | ');

	// Remove remaining HTML/JSX tags but keep content
	content = content.replace(/<[^>]+>/g, ' ');

	// Clean up extra whitespace
	content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
	content = content.replace(/[ \t]+/g, ' ');
	content = content.replace(/^\s+|\s+$/gm, '');

	return content;
}

/**
 * Generate URL from file path
 */
function generateUrlFromPath(filePath) {
	// Convert file path to URL
	let url = filePath.replace('./content', '').replace(/\.mdx$/, '');

	// Handle index files
	if (url.endsWith('/index')) {
		url = url.replace('/index', '');
	}

	// Ensure starts with /
	if (!url.startsWith('/')) {
		url = '/' + url;
	}

	// Handle root index
	if (url === '/index') {
		url = '/';
	}

	return url;
}

/**
 * Extract title from content
 */
function extractTitleFromContent(content) {
	const titleMatch = content.match(/^#\s+(.+)$/m);
	return titleMatch ? titleMatch[1].trim() : null;
}

/**
 * Combine MDX content with imported content
 */
function combineContent(mdxContent, importedContent) {
	let combined = mdxContent;

	if (Object.keys(importedContent).length > 0) {
		combined += '\n\n## Referenced Components and Utilities\n\n';

		for (const [importPath, content] of Object.entries(importedContent)) {
			if (content) {
				combined += `### ${importPath}\n\n${content}\n\n`;
			}
		}
	}

	return combined;
}

/**
 * Save scraped content
 */
async function saveScrapedContent(scrapedPages, outputPath) {
	console.log('📝 Saving scraped content...');

	// Create consolidated content
	let consolidatedContent = '';

	for (const page of scrapedPages) {
		const fileName = generateFileName(page.url);

		// Build frontmatter
		let frontmatter = `---
title: "${page.title}"
url: "${page.url}"
file_path: "${page.filePath}"`;

		if (page.description) {
			const escapedDescription = page.description.replace(/"/g, '\\"');
			frontmatter += `
description: "${escapedDescription}"`;
		}

		if (page.keywords && Array.isArray(page.keywords) && page.keywords.length > 0) {
			frontmatter += `
keywords:`;
			page.keywords.forEach((keyword) => {
				frontmatter += `
  - "${keyword}"`;
			});
		}

		if (page.imports && page.imports.length > 0) {
			frontmatter += `
imports:`;
			page.imports.forEach((imp) => {
				frontmatter += `
  - "${imp}"`;
			});
		}

		frontmatter += `
---`;

		const mdxContent = `${frontmatter}

# ${page.title}

${page.content}
`;

		// Save individual file
		await fs.writeFile(path.join(outputPath, `${fileName}.mdx`), mdxContent, 'utf8');

		// Add to consolidated content
		consolidatedContent += `# ${page.title}\n\nURL: ${page.url}\nFile: ${page.filePath}\n`;
		if (page.description) {
			consolidatedContent += `Description: ${page.description}\n`;
		}
		if (page.keywords && page.keywords.length > 0) {
			consolidatedContent += `Keywords: ${page.keywords.join(', ')}\n`;
		}
		if (page.imports && page.imports.length > 0) {
			consolidatedContent += `Imports: ${page.imports.join(', ')}\n`;
		}
		consolidatedContent += `\n${page.content}\n\n---\n\n`;
	}

	// Save consolidated content
	await fs.writeFile(path.join(outputPath, 'sei-docs-consolidated.txt'), consolidatedContent, 'utf8');

	// Save structured JSON
	await fs.writeFile(path.join(outputPath, 'sei-docs-structured.json'), JSON.stringify(scrapedPages, null, 2), 'utf8');

	console.log(`📄 Created consolidated text file: ${outputPath}/sei-docs-consolidated.txt`);
	console.log(`📋 Created structured JSON file: ${outputPath}/sei-docs-structured.json`);
	console.log(`📁 Created ${scrapedPages.length} individual .mdx files`);
}

/**
 * Generate filename from URL
 */
function generateFileName(url) {
	try {
		const urlObj = new URL(url);
		let pathname = urlObj.pathname;

		// Remove leading/trailing slashes and replace special chars
		pathname = pathname.replace(/^\/+|\/+$/g, '');
		pathname = pathname.replace(/[/\\:*?"<>|]/g, '-');
		pathname = pathname.replace(/-+/g, '-');

		// Remove any "content-" prefix that might have been created
		pathname = pathname.replace(/^content-?/, '');

		return pathname || 'index';
	} catch {
		return 'page-' + Date.now();
	}
}

// Run the scraper
scrapeDocsRendered();
