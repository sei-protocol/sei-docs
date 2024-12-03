import { useState } from 'react';

const SimpleSeiTools = () => {
	const [selectedTool, setSelectedTool] = useState('associatedWalletLookup');
	const [hexAddress, setHexAddress] = useState('');
	const [bech32Address, setBech32Address] = useState('');
	const [pubKey, setPubKey] = useState('');
	const [result, setResult] = useState('');
	const [error, setError] = useState('');

	const handleToolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedTool(e.target.value);
		resetFields();
	};

	const resetFields = () => {
		setHexAddress('');
		setBech32Address('');
		setPubKey('');
		setResult('');
		setError('');
	};

	const handleApiCall = async (method: string, params: any[], url: string) => {
		setError('');
		setResult('');

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
			});

			const data = await response.json();

			if (data.result) {
				setResult(data.result);
			} else if (data.error) {
				setError(data.error.message);
			}
		} catch (err) {
			setError('Failed to fetch data. Please try again.');
		}
	};

	const handleLookup = async () => {
		const seiRpcUrl = 'https://rpc.sei-apis.com';
		const seiEvmUrl = process.env.NEXT_PUBLIC_SEIEVM || 'https://your-default-evm-url.com';

		switch (selectedTool) {
			case 'associatedWalletLookup':
				if (hexAddress) {
					await handleApiCall('sei_getSeiAddress', [hexAddress], seiEvmUrl);
				} else if (bech32Address) {
					await handleApiCall('sei_getEVMAddress', [bech32Address], seiRpcUrl);
				} else {
					setError('Please enter a valid address.');
				}
				break;

			case 'bothAddressesGenerator':
				if (!pubKey) {
					setError('Please enter a valid public key.');
					return;
				}
				// Example transformation logic for pubKey (to be replaced with actual logic)
				const generatedHex = `0x${pubKey.substring(0, 40)}`;
				const generatedBech32 = `sei1${pubKey.substring(0, 38)}`;
				setHexAddress(generatedHex);
				setBech32Address(generatedBech32);
				setResult(`Generated Hex: ${generatedHex}, Bech32: ${generatedBech32}`);
				break;

			case 'associatedTxHashLookup':
				if (bech32Address) {
					await handleApiCall('sei_getTxHashes', [bech32Address], seiRpcUrl); // Example API method
				} else {
					setError('Please enter a valid Bech32 address.');
				}
				break;

			case 'assetPointerDetailsLookup':
				if (hexAddress) {
					await handleApiCall('sei_getAssetDetails', [hexAddress], seiRpcUrl); // Example API method
				} else {
					setError('Please enter a valid Hex address.');
				}
				break;

			default:
				setError('Invalid tool selected.');
				break;
		}
	};

	return (
		<div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
			<h1>Simple Sei Tools</h1>

			<div style={{ marginBottom: '20px' }}>
				<label>
					Select Tool:
					<select value={selectedTool} onChange={handleToolChange} style={{ marginLeft: '10px', padding: '5px' }}>
						<option value='associatedWalletLookup'>Associated Wallet Lookup</option>
						<option value='bothAddressesGenerator'>Generate Both Addresses (from PubKey)</option>
						<option value='associatedTxHashLookup'>Associated Tx Hash Lookup</option>
						<option value='assetPointerDetailsLookup'>Asset/Pointer Details Lookup</option>
					</select>
				</label>
			</div>

			{/* Dynamic Fields */}
			{selectedTool === 'associatedWalletLookup' && (
				<div>
					<label>
						Hex Address:
						<input
							type='text'
							value={hexAddress}
							onChange={(e) => setHexAddress(e.target.value)}
							placeholder='Enter Hex Address (0x...)'
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
					</label>
					<label>
						Bech32 Address:
						<input
							type='text'
							value={bech32Address}
							onChange={(e) => setBech32Address(e.target.value)}
							placeholder='Enter Bech32 Address (sei1...)'
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
					</label>
				</div>
			)}

			{selectedTool === 'bothAddressesGenerator' && (
				<div>
					<label>
						Public Key:
						<input
							type='text'
							value={pubKey}
							onChange={(e) => setPubKey(e.target.value)}
							placeholder='Enter Public Key'
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
					</label>
				</div>
			)}

			{selectedTool === 'associatedTxHashLookup' && (
				<div>
					<label>
						Bech32 Address:
						<input
							type='text'
							value={bech32Address}
							onChange={(e) => setBech32Address(e.target.value)}
							placeholder='Enter Bech32 Address'
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
					</label>
				</div>
			)}

			{selectedTool === 'assetPointerDetailsLookup' && (
				<div>
					<label>
						Hex Address:
						<input
							type='text'
							value={hexAddress}
							onChange={(e) => setHexAddress(e.target.value)}
							placeholder='Enter Hex Address'
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
					</label>
				</div>
			)}

			<button onClick={handleLookup} style={{ padding: '10px 20px', marginTop: '20px' }}>
				Execute
			</button>

			{/* Result/Error Display */}
			<div style={{ marginTop: '20px' }}>
				{result && (
					<p>
						<strong>Result:</strong> {result}
					</p>
				)}
				{error && (
					<p style={{ color: 'red' }}>
						<strong>Error:</strong> {error}
					</p>
				)}
			</div>
		</div>
	);
};

export default SimpleSeiTools;
