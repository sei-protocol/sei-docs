const fs = require('fs').promises;
const path = require('path');

// Configuration
const TRIEVE_API_BASE = 'https://api.trieve.ai/api';
const SCRAPED_DOCS_DIR = './public/_scraped-docs';
const DELAY_BETWEEN_OPERATIONS = 500;

async function uploadToTrieve() {
	const apiKey = process.env.TRIEVE_API_KEY;
	const datasetId = process.env.TRIEVE_DATASET_ID;

	if (!apiKey || !datasetId) {
		console.error('❌ Missing required environment variables: TRIEVE_API_KEY and TRIEVE_DATASET_ID must be set');
		process.exit(1);
	}

	try {
		console.log('🚀 Starting Trieve file update...');

		console.log('📋 Fetching existing files from Trieve...');
		const existingFiles = await getAllExistingFiles(apiKey, datasetId);
		console.log(`📄 Found ${existingFiles.length} existing files`);

		console.log('📖 Loading scraped documentation files...');
		const scrapedFiles = await loadScrapedFiles();
		console.log(`📄 Found ${scrapedFiles.length} files to process`);

		console.log('🔄 Comparing files...');
		const { toUpload, toDelete } = await compareFiles(existingFiles, scrapedFiles);

		console.log(`📊 Analysis complete:`);
		console.log(`   📤 ${toUpload.length} files to upload/update`);
		console.log(`   🗑️  ${toDelete.length} files to delete`);

		if (toUpload.length > 0) {
			console.log('📤 Uploading/updating files...');
			await uploadFiles(toUpload, apiKey, datasetId);
		}

		if (toDelete.length > 0) {
			console.log('🗑️  Deleting obsolete files...');
			await deleteFiles(toDelete, apiKey, datasetId);
		}

		if (toUpload.length === 0 && toDelete.length === 0) {
			console.log('✨ No changes detected - dataset is up to date!');
		} else {
			console.log('✅ Successfully updated Trieve dataset!');
		}
	} catch (error) {
		console.error('❌ Error updating Trieve dataset:', error);
		process.exit(1);
	}
}

async function getAllExistingFiles(apiKey, datasetId) {
	console.log('🔍 Fetching existing files from Trieve...');
	const allFiles = [];
	let cursor = null;
	let hasMore = true;
	let pageCount = 0;
	const maxPages = 50; // Safety limit

	while (hasMore && pageCount < maxPages) {
		pageCount++;
		console.log(`   📄 Fetching page ${pageCount}...`);

		const url = new URL(`${TRIEVE_API_BASE}/dataset/scroll_files`);
		url.searchParams.append('page_size', '250');
		if (cursor) {
			url.searchParams.append('offset_file_id', cursor);
		}

		try {
			const response = await fetch(url.toString(), {
				method: 'GET',
				headers: {
					Authorization: apiKey,
					'TR-Dataset': datasetId
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log(`   📄 Received ${data.file_with_chunk_groups?.length || 0} files`);

			if (data.file_with_chunk_groups && data.file_with_chunk_groups.length > 0) {
				allFiles.push(...data.file_with_chunk_groups);
			}

			if (cursor === data.next_cursor) {
				console.log('   📄 Reached end of results');
				hasMore = false;
			} else {
				cursor = data.next_cursor;
			}

			// Add delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			console.error(`   ❌ Error fetching page ${pageCount}:`, error.message);
			break;
		}
	}

	if (pageCount >= maxPages) {
		console.log(`⚠️  Reached maximum page limit (${maxPages}), stopping fetch`);
	}

	console.log(`✅ Found ${allFiles.length} total files`);
	return allFiles;
}

async function loadScrapedFiles() {
	try {
		const files = await fs.readdir(SCRAPED_DOCS_DIR);
		const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

		const fileData = [];
		for (const fileName of mdxFiles) {
			const filePath = path.join(SCRAPED_DOCS_DIR, fileName);
			const content = await fs.readFile(filePath, 'utf8');

			fileData.push({
				fileName: fileName.replace('.mdx', '.md'),
				content,
				filePath
			});
		}

		return fileData;
	} catch (error) {
		throw new Error(`Failed to load scraped files: ${error.message}`);
	}
}

async function compareFiles(existingFiles, scrapedFiles) {
	const existingByFileName = new Map();

	existingFiles.forEach((file) => {
		const name = ((file.file_metadata && file.file_metadata.file_name) || file.file_name || '').replace('.mdx', '.md');
		existingByFileName.set(name, file);
	});

	const toUpload = [];
	const processedFileNames = new Set();

	for (const fileData of scrapedFiles) {
		const fileName = fileData.fileName.replace('.mdx', '.md');
		processedFileNames.add(fileName);

		const existingFile = existingByFileName.get(fileName);
		const contentLength = fileData.content.length;

		if (!existingFile) {
			console.log(`   🆕 NEW: ${fileName}`);
			toUpload.push({
				fileName,
				fileContent: fileData.content,
				contentLength,
				action: 'create'
			});
		} else {
			// Check if content has changed by comparing content length
			const existingLength =
				(existingFile && existingFile.file_metadata && existingFile.file_metadata.metadata && existingFile.file_metadata.metadata.content_length) ??
				existingFile?.metadata?.content_length;

			if (existingLength !== contentLength) {
				// Content has changed - needs to be updated
				const reason = !existingLength ? 'no length stored' : 'content changed';
				console.log(`   🔄 UPDATE: ${fileName} (${reason})`);
				toUpload.push({
					fileName,
					fileContent: fileData.content,
					contentLength,
					action: 'update',
					existingFileId: (existingFile && existingFile.file_metadata && existingFile.file_metadata.id) || existingFile.id
				});
			} else {
				console.log(`   ✅ SKIP: ${fileName} (unchanged)`);
			}
		}
	}

	// Find files to delete (exist in Trieve but not in scraped files)
	const toDelete = [];
	for (const [fileName, existingFile] of existingByFileName) {
		if (!processedFileNames.has(fileName)) {
			toDelete.push(existingFile);
		}
	}

	return { toUpload, toDelete };
}

async function uploadFiles(filesToUpload, apiKey, datasetId) {
	let uploadedCount = 0;

	for (const fileData of filesToUpload) {
		try {
			// If updating, delete the old file first
			if (fileData.action === 'update') {
				console.log(`🔄 Updating ${fileData.fileName}...`);
				await deleteFile(fileData.existingFileId, apiKey, datasetId);
				await delay(DELAY_BETWEEN_OPERATIONS);
			} else {
				console.log(`📤 Uploading ${fileData.fileName}...`);
			}

			// Upload the new/updated file
			await uploadFile(fileData, apiKey, datasetId);
			uploadedCount++;

			// Add delay between uploads
			await delay(DELAY_BETWEEN_OPERATIONS);
		} catch (error) {
			console.error(`❌ Failed to upload ${fileData.fileName}:`, error);
			throw error;
		}
	}

	console.log(`✅ Successfully uploaded ${uploadedCount} files`);
}

async function uploadFile(fileData, apiKey, datasetId) {
	const base64Content = Buffer.from(fileData.fileContent).toString('base64');

	const metadata = {
		source: 'sei-docs',
		content_length: fileData.contentLength,
		scraped_at: new Date().toISOString()
	};

	const tagSet = ['sei-docs'];

	// Use .md extension for consistency
	const uploadFileName = fileData.fileName.replace('.mdx', '.md');

	const requestBody = {
		base64_file: base64Content,
		file_name: uploadFileName,
		description: `Documentation file: ${uploadFileName}`,
		metadata: metadata,
		tag_set: tagSet,
		time_stamp: new Date().toISOString(),
		create_chunks: true,
		target_splits_per_chunk: 20,
		split_delimiters: ['\n\n', '\n', '.', '!', '?']
	};

	const response = await fetch(`${TRIEVE_API_BASE}/file`, {
		method: 'POST',
		headers: {
			Authorization: apiKey,
			'Content-Type': 'application/json',
			'TR-Dataset': datasetId
		},
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to upload file: ${response.status} ${response.statusText}\n${errorText}`);
	}

	return await response.json();
}

async function deleteFiles(filesToDelete, apiKey, datasetId) {
	let deletedCount = 0;

	for (const file of filesToDelete) {
		try {
			const name = (file.file_metadata && file.file_metadata.file_name) || file.file_name || '(unknown)';
			const id = (file.file_metadata && file.file_metadata.id) || file.id;
			console.log(`🗑️  Deleting ${name}...`);
			await deleteFile(id, apiKey, datasetId);
			deletedCount++;

			// Add delay between deletions
			await delay(DELAY_BETWEEN_OPERATIONS);
		} catch (error) {
			console.error(`❌ Failed to delete ${file.file_name}:`, error);
			throw error;
		}
	}

	console.log(`✅ Successfully deleted ${deletedCount} files`);
}

async function deleteFile(fileId, apiKey, datasetId) {
	// First try deleting file and chunks together. Some older files may not
	// have an associated chunk group, which can cause a 400. If we detect that
	// specific error, retry deletion without the delete_chunks flag.
	const doDelete = async (withChunks) =>
		fetch(`${TRIEVE_API_BASE}/file/${fileId}${withChunks ? '?delete_chunks=true' : ''}`, {
			method: 'DELETE',
			headers: {
				Authorization: apiKey,
				'TR-Dataset': datasetId
			}
		});

	const response = await doDelete(true);
	if (response.ok) return;

	const errorText = await response.text();
	const needsRetry = response.status === 400 && /Error getting group id for file_id/i.test(errorText);

	if (!needsRetry) {
		throw new Error(`Failed to delete file: ${response.status} ${response.statusText}\n${errorText}`);
	}

	const retryResponse = await doDelete(false);
	if (!retryResponse.ok) {
		const retryText = await retryResponse.text();
		throw new Error(`Failed to delete file (retry without delete_chunks): ${retryResponse.status} ${retryResponse.statusText}\n${retryText}`);
	}
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run the script
if (require.main === module) {
	uploadToTrieve();
}

module.exports = { uploadToTrieve };
