// Load the Bytebellai widget script for its side effects only
export async function loadBytebellaiWidget(): Promise<void> {
	await import('./index.js');
}
