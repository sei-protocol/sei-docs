import { Callout } from 'nextra/components';

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

	const ContractLink = ({ address, name }: { address: string; name: string }) => {
		if (!address || !address.trim()) {
			return <span className='text-gray-500 italic'>No contract address</span>;
		}

		// Clean the address
		const cleanAddress = address.trim();

		let explorerName = 'SeiScan';

		let explorerUrl = `https://seiscan.io/address/${cleanAddress}`;
		const shortAddress = `${cleanAddress}`;

		return (
			<div className='flex items-center gap-2'>
				<code className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono'>{shortAddress}</code>
				{explorerUrl !== '#' && (
					<a
						href={explorerUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors no-underline'>
						{explorerName} ↗
					</a>
				)}
			</div>
		);
	};

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
		const totalContracts = data.length;
		const totalProjects = groupedData.length;

		return (
			<div className='space-y-8'>
				{/* Summary stats */}

				{/* Project groups */}
				{groupedData.map((group, groupIndex) => (
					<div key={groupIndex} className='space-y-4'>
						{/* Project header */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<h3 className='text-lg font-bold text-gray-900 dark:text-white'>{group.projectName}</h3>
								<span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full'>
									{group.contractCount} contract{group.contractCount !== 1 ? 's' : ''}
								</span>
							</div>
							<div className='text-xs text-gray-500 dark:text-gray-400'>#{groupIndex + 1}</div>
						</div>

						{/* Contracts table for this project */}
						<div className='overflow-x-auto'>
							<table className='w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg'>
								<thead>
									<tr className='bg-gray-50 dark:bg-gray-800'>
										<th className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>#</th>
										<th className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
											Contract Name
										</th>
										<th className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
											Contract Address
										</th>
									</tr>
								</thead>
								<tbody>
									{group.contracts.map((contract, contractIndex) => (
										<tr key={contractIndex} className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
											<td className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-600 dark:text-gray-400'>{contractIndex + 1}</td>
											<td className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white font-medium'>
												{contract[headers[2]] || 'Unnamed Contract'}
											</td>
											<td className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm'>
												<ContractLink address={contract[headers[1]]} name={group.projectName} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile card view for this project */}
						<div className='block sm:hidden space-y-3'>
							{group.contracts.map((contract, contractIndex) => (
								<div key={contractIndex} className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800'>
									<div className='flex items-center justify-between mb-3'>
										<span className='text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>Contract #{contractIndex + 1}</span>
									</div>
									<div className='space-y-2'>
										<div>
											<span className='text-xs text-gray-500 dark:text-gray-400 block mb-1'>Contract Name</span>
											<span className='text-sm font-medium text-gray-900 dark:text-white'>{contract[headers[2]] || 'Unnamed Contract'}</span>
										</div>
										<div>
											<span className='text-xs text-gray-500 dark:text-gray-400 block mb-1'>Contract Address</span>
											<ContractLink address={contract[headers[1]]} name={group.projectName} />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		);
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
