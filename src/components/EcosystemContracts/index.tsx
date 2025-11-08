import { Callout } from 'nextra/components';
import EcosystemContractsTabs from './TabsView';

// CSV file component - reads a local CSV file at build time
// Just download your Google Sheet as CSV and place it in your project
export async function RemoteSheetData() {
	let content: any[] | null = null;
	let error: Error | null = null;

	const parseCSV = (csvText: string) => {
		if (!csvText) return [];

		const lines = csvText.split('\n').filter((line) => line.trim());
		if (lines.length === 0) return [];

		// Parse headers from first row
		const headers = parseCSVRow(lines[0]);

		// Parse data rows
		const data: Record<string, string>[] = [];
		for (let i = 1; i < lines.length; i++) {
			const row = parseCSVRow(lines[i]);
			if (row.length > 0 && row.some((cell) => cell.trim())) {
				const rowObject: Record<string, string> = {};
				headers.forEach((header, index) => {
					rowObject[header] = row[index] || '';
				});
				data.push(rowObject);
			}
		}

		return data;
	};

	const parseCSVRow = (row: string): string[] => {
		const result: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < row.length; i++) {
			const char = row[i];
			const nextChar = row[i + 1];

			if (char === '"') {
				if (inQuotes && nextChar === '"') {
					// Escaped quote
					current += '"';
					i++; // Skip next quote
				} else {
					// Toggle quote state
					inQuotes = !inQuotes;
				}
			} else if (char === ',' && !inQuotes) {
				// End of field
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}

		// Add the last field
		result.push(current.trim());
		return result;
	};

	try {
		// Import fs/promises for Node.js file system access (build time)
		const fs = await import('fs/promises');
		const path = await import('path');

		let csvText = '';

		const filePath = path.join(process.cwd(), 'src/components/EcosystemContracts/Ecosystem-Contracts.csv');

		csvText = await fs.readFile(filePath, { encoding: 'utf8' });

		content = parseCSV(csvText);
	} catch (err: any) {
		error = err as Error;
	}

	// ---------------------------- helpers ----------------------------

	const groupDataByProject = (data: any[]) => {
		if (!data || data.length === 0) return [];

		const groups: { [key: string]: any[] } = {};
		const headers = Object.keys(data[0]);
		const projectNameKey = headers[0]; // First column is project name

		data.forEach((row) => {
			const projectName = row[projectNameKey]?.trim();
			if (projectName) {
				if (!groups[projectName]) {
					groups[projectName] = [];
				}
				groups[projectName].push(row);
			}
		});

		return Object.entries(groups).map(([projectName, contracts]) => ({
			projectName,
			contracts,
			contractCount: contracts.length
		}));
	};

	const renderSheetData = (data: any[]) => {
		if (!data || data.length === 0) {
			return <div className='text-gray-500 dark:text-gray-400 italic py-8 text-center'>No data available</div>;
		}

		const groupedData = groupDataByProject(data);
		const headers = Object.keys(data[0]);
		return <EcosystemContractsTabs groupedData={groupedData} nameKey={headers[2]} addressKey={headers[1]} />;
	};

	// ---------------------------- rendering ----------------------------

	if (error) {
		return <Callout type='error'>{error.message}</Callout>;
	}

	if (!content) {
		return <Callout type='warning'>No CSV data available.</Callout>;
	}

	return (
		<div className='my-6'>
			<div className='sheet-content'>{renderSheetData(content)}</div>
		</div>
	);
}
