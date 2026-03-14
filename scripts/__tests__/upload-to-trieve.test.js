import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import path from 'node:path';

const mockReadFile = mock();

mock.module('fs', () => ({
	promises: {
		readFile: mockReadFile
	}
}));

const { uploadToTrieve } = await import('../upload-to-trieve.js');

globalThis.fetch = mock();

const mockApiKey = 'test-api-key';
const mockDatasetId = 'test-dataset-id';
const mockScrapedData = [
	{
		title: 'Test Page 1',
		url: 'https://docs.sei.io/test-page-1',
		filePath: '/test/page1.html',
		content: '<p>Test content 1</p>',
		description: 'Test description 1',
		keywords: ['test', 'page1']
	},
	{
		title: 'Test Page 2',
		url: 'https://docs.sei.io/learn/test-page-2',
		filePath: '/test/page2.html',
		content: '<p>Test content 2</p>',
		description: 'Test description 2',
		keywords: ['learn', 'page2']
	}
];

const mockExistingFiles = [
	{
		id: 'file-1',
		file_name: 'test-page-1.md',
		size: 1000,
		tag_set: ['sei-docs'],
		metadata: {
			content_hash: 'old-hash-1',
			source: 'sei-docs'
		}
	},
	{
		id: 'file-2',
		file_name: 'obsolete-page.md',
		size: 500,
		tag_set: ['sei-docs'],
		metadata: {
			content_hash: 'old-hash-2',
			source: 'sei-docs'
		}
	}
];

describe('upload-to-trieve', () => {
	beforeEach(() => {
		process.env.TRIEVE_API_KEY = mockApiKey;
		process.env.TRIEVE_DATASET_ID = mockDatasetId;

		fetch.mockReset();
		mockReadFile.mockReset();

		spyOn(console, 'log').mockImplementation(() => {});
		spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		delete process.env.TRIEVE_API_KEY;
		delete process.env.TRIEVE_DATASET_ID;

		console.log.mockRestore();
		console.error.mockRestore();
	});

	describe('Environment Variables', () => {
		test('should exit with error if TRIEVE_API_KEY is missing', async () => {
			delete process.env.TRIEVE_API_KEY;
			const mockExit = spyOn(process, 'exit').mockImplementation(() => {});

			await uploadToTrieve();

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(console.error).toHaveBeenCalledWith('❌ Missing required environment variables:');

			mockExit.mockRestore();
		});

		test('should exit with error if TRIEVE_DATASET_ID is missing', async () => {
			delete process.env.TRIEVE_DATASET_ID;
			const mockExit = spyOn(process, 'exit').mockImplementation(() => {});

			await uploadToTrieve();

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(console.error).toHaveBeenCalledWith('❌ Missing required environment variables:');

			mockExit.mockRestore();
		});
	});

	describe('File Fetching', () => {
		test('should successfully fetch existing files', async () => {
			fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							file_with_chunk_groups: mockExistingFiles,
							next_cursor: null
						})
				})
				.mockResolvedValue({ ok: true });

			mockReadFile.mockResolvedValue(JSON.stringify(mockScrapedData));

			await uploadToTrieve();

			const scrollCall = fetch.mock.calls.find((call) => call[0].includes('/dataset/scroll_files'));
			expect(scrollCall).toBeDefined();
			expect(scrollCall[1].method).toBe('GET');
			expect(scrollCall[1].headers.Authorization).toBe(mockApiKey);
			expect(scrollCall[1].headers['TR-Dataset']).toBe(mockDatasetId);
		});

		test('should handle fetch files API error', async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				status: 403,
				statusText: 'Forbidden'
			});

			const mockExit = spyOn(process, 'exit').mockImplementation(() => {});

			await uploadToTrieve();

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(console.error).toHaveBeenCalledWith('❌ Error updating Trieve dataset:', expect.any(Error));

			mockExit.mockRestore();
		});
	});

	describe('Data Loading', () => {
		test('should successfully load scraped data', async () => {
			fetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: true });

			mockReadFile.mockResolvedValue(JSON.stringify(mockScrapedData));

			await uploadToTrieve();

			expect(mockReadFile).toHaveBeenCalledWith(path.join('./public/_scraped-docs', 'sei-docs-structured.json'), 'utf8');
		});

		test('should handle file reading error', async () => {
			fetch.mockResolvedValueOnce({ ok: true });
			mockReadFile.mockRejectedValue(new Error('File not found'));

			const mockExit = spyOn(process, 'exit').mockImplementation(() => {});

			await uploadToTrieve();

			expect(mockExit).toHaveBeenCalledWith(1);

			mockExit.mockRestore();
		});
	});

	describe('File Comparison', () => {
		test('should identify files to create, update, and delete', async () => {
			fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							file_with_chunk_groups: mockExistingFiles,
							next_cursor: null
						})
				})
				.mockResolvedValue({ ok: true });

			mockReadFile.mockResolvedValue(JSON.stringify(mockScrapedData));

			await uploadToTrieve();

			const uploadCalls = fetch.mock.calls.filter((call) => call[0].includes('/file') && call[1].method === 'POST');
			const deleteCalls = fetch.mock.calls.filter((call) => call[0].includes('/file/') && call[1].method === 'DELETE');

			expect(uploadCalls.length + deleteCalls.length).toBeGreaterThan(0);
		});

		test('should handle files without description or keywords', async () => {
			const minimalData = [
				{
					title: 'Minimal Page',
					url: 'https://docs.sei.io/minimal',
					filePath: '/minimal.html',
					content: '<p>Minimal content</p>'
				}
			];

			fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							file_with_chunk_groups: [],
							next_cursor: null
						})
				})
				.mockResolvedValue({ ok: true });

			mockReadFile.mockResolvedValue(JSON.stringify(minimalData));

			await uploadToTrieve();

			const uploadCall = fetch.mock.calls.find((call) => call[0].includes('/file') && call[1].method === 'POST');

			expect(uploadCall).toBeDefined();
			const uploadBody = JSON.parse(uploadCall[1].body);

			expect(uploadBody.metadata).not.toHaveProperty('description');
			expect(uploadBody.metadata).not.toHaveProperty('keywords');
			expect(uploadBody.tag_set).toEqual(['sei-docs']);
		});
	});

	describe('File Upload', () => {
		test('should upload files individually', async () => {
			fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							file_with_chunk_groups: [],
							next_cursor: null
						})
				})
				.mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ file_metadata: { id: 'new-file-id' } })
				});

			mockReadFile.mockResolvedValue(JSON.stringify(mockScrapedData));

			await uploadToTrieve();

			const uploadCalls = fetch.mock.calls.filter((call) => call[0].includes('/file') && call[1].method === 'POST');

			expect(uploadCalls).toHaveLength(2);

			const firstUpload = JSON.parse(uploadCalls[0][1].body);
			expect(firstUpload).toMatchObject({
				file_name: expect.stringMatching(/\.md$/),
				base64_file: expect.any(String),
				create_chunks: true,
				tag_set: expect.arrayContaining(['sei-docs']),
				metadata: expect.objectContaining({
					source: 'sei-docs',
					content_hash: expect.any(String)
				})
			});
		});

		test('should handle upload API errors', async () => {
			fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							file_with_chunk_groups: [],
							next_cursor: null
						})
				})
				.mockResolvedValueOnce({
					ok: false,
					status: 400,
					statusText: 'Bad Request',
					text: () => Promise.resolve('Invalid file data')
				});

			mockReadFile.mockResolvedValue(JSON.stringify(mockScrapedData));

			const mockExit = spyOn(process, 'exit').mockImplementation(() => {});

			await uploadToTrieve();

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(console.error).toHaveBeenCalledWith('❌ Error updating Trieve dataset:', expect.any(Error));

			mockExit.mockRestore();
		});
	});

	describe('Success Flow', () => {
		test('should complete full upload process successfully', async () => {
			fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							file_with_chunk_groups: [],
							next_cursor: null
						})
				})
				.mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ file_metadata: { id: 'file-id' } })
				});

			mockReadFile.mockResolvedValue(JSON.stringify(mockScrapedData));

			await uploadToTrieve();

			expect(console.log).toHaveBeenCalledWith('🚀 Starting intelligent Trieve file update...');
			expect(console.log).toHaveBeenCalledWith('📄 Found 0 existing files');
			expect(console.log).toHaveBeenCalledWith('📄 Found 2 pages to process');
			expect(console.log).toHaveBeenCalledWith('✅ Successfully uploaded 2 files');
			expect(console.log).toHaveBeenCalledWith('✅ Successfully updated Trieve dataset!');
		});

		test('should handle no changes scenario', async () => {
			const matchingFiles = [
				{
					id: 'file-1',
					file_name: 'test-page-1.md',
					tag_set: ['sei-docs'],
					metadata: {
						content_hash: 'matching-hash',
						source: 'sei-docs'
					}
				}
			];

			fetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						file_with_chunk_groups: matchingFiles,
						next_cursor: null
					})
			});

			mockReadFile.mockResolvedValue(JSON.stringify([mockScrapedData[0]]));

			await uploadToTrieve();

			expect(console.log).toHaveBeenCalledWith('🔄 Analyzing file changes...');
			expect(console.log).toHaveBeenCalledWith('📊 Analysis complete:');
		});
	});
});
