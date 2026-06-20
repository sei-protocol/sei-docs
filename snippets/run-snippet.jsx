// RunSnippet — a click-to-load "Try it" button for read-only EVM JSON-RPC calls.
//
// Sei's public EVM RPC endpoints return `access-control-allow-origin: *`, so a
// read-only call can be issued straight from the browser with a plain `fetch`
// POST — no SDK, no proxy. Mintlify's React runtime cannot import npm packages,
// so this component uses only browser globals (fetch, BigInt).
//
// Theming note: Mintlify applies `dark:text-*` utilities (class strategy) but
// NOT `dark:bg-*` / `dark:border-*` on custom-snippet container <div>s — verified
// empirically. So surfaces and hairlines use theme-agnostic translucent inline
// styles (rgba grey), which render correctly over both light and dark backdrops,
// while text keeps the working `dark:text-*` classes.
//
// Usage in MDX:
//   import { RunSnippet } from '/snippets/run-snippet.jsx';
//
//   <RunSnippet method="eth_blockNumber" />
//   <RunSnippet
//     method="eth_getBalance"
//     params={["0x0000000000000000000000000000000000000000", "latest"]}
//     network="testnet"
//     description="Read the SEI balance of an address at the latest block."
//   />
export const RunSnippet = (props) => {
	const {
		method = 'eth_blockNumber',
		params = [],
		network = 'testnet',
		endpoint,
		label,
		title,
		description,
		decode = 'auto'
	} = props || {};

	// --- config (kept inside the component: module-level decls crash in Mintlify) ---
	const ENDPOINTS = {
		testnet: 'https://evm-rpc-testnet.sei-apis.com',
		mainnet: 'https://evm-rpc.sei-apis.com'
	};
	const rpcUrl = endpoint || ENDPOINTS[network] || ENDPOINTS.testnet;
	const networkLabel = network === 'mainnet' ? 'pacific-1 · mainnet' : network === 'testnet' ? 'atlantic-2 · testnet' : network;

	const requestBody = { jsonrpc: '2.0', id: 1, method, params };
	const requestJson = JSON.stringify(requestBody, null, 2);

	// --- state ---
	const [phase, setPhase] = useState('idle'); // idle | loading | success | error
	const [result, setResult] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);
	const [elapsed, setElapsed] = useState(null);
	const [copied, setCopied] = useState(false);
	const [btnHover, setBtnHover] = useState(false);

	// --- helpers (nested) ---
	const groupThousands = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	const hexToDecimal = (value) => {
		if (typeof value !== 'string' || !/^0x[0-9a-fA-F]+$/.test(value)) return null;
		try {
			return groupThousands(BigInt(value).toString(10));
		} catch (e) {
			return null;
		}
	};

	const run = async () => {
		setPhase('loading');
		setErrorMsg(null);
		setResult(null);
		setElapsed(null);
		const startedAt = typeof performance !== 'undefined' ? performance.now() : null;
		try {
			const response = await fetch(rpcUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody)
			});
			const data = await response.json();
			if (startedAt != null && typeof performance !== 'undefined') {
				setElapsed(Math.round(performance.now() - startedAt));
			}
			if (data && data.error) {
				setErrorMsg(data.error.message || 'RPC returned an error');
				setPhase('error');
				return;
			}
			setResult(data ? data.result : undefined);
			setPhase('success');
		} catch (err) {
			setErrorMsg(err && err.message ? err.message : 'Request failed');
			setPhase('error');
		}
	};

	const resultString = result === undefined ? 'undefined' : JSON.stringify(result, null, 2);
	const decoded = decode !== 'off' && typeof result === 'string' ? hexToDecimal(result) : null;

	const copyResult = () => {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(resultString);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	// --- icons (nested) ---
	const SpinnerIcon = () => (
		<svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
			<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
			<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z' />
		</svg>
	);

	const PlayIcon = () => (
		<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
			<path d='M8 5v14l11-7z' />
		</svg>
	);

	// --- theme-agnostic surfaces (see theming note above) ---
	const HAIRLINE = 'rgba(128, 128, 128, 0.25)';
	const surfaceStyle = { backgroundColor: 'rgba(128, 128, 128, 0.08)' };
	const monoStyle = { fontFamily: 'var(--sei-font-mono)' };
	const codeStyle = { backgroundColor: 'rgba(128, 128, 128, 0.05)', fontFamily: 'var(--sei-font-mono)' };

	const cardClass = 'not-prose w-full rounded-lg border overflow-hidden my-4';
	const headerClass = 'flex items-center justify-between gap-3 px-4 py-2.5 border-b';
	const labelClass = 'text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500';
	const preClass = 'm-0 px-4 py-3 text-sm overflow-x-auto text-neutral-700 dark:text-neutral-300';

	const buttonStyle = {
		backgroundColor: btnHover ? 'var(--sei-maroon-200)' : 'var(--sei-maroon-100)',
		color: '#ffffff',
		fontFamily: 'var(--sei-font-mono)',
		textTransform: 'uppercase',
		letterSpacing: '0.04em',
		fontSize: '10px',
		opacity: phase === 'loading' ? 0.7 : 1,
		cursor: phase === 'loading' ? 'default' : 'pointer'
	};

	return (
		<div className={cardClass} style={{ borderColor: HAIRLINE }}>
			<div className={headerClass} style={{ ...surfaceStyle, borderBottomColor: HAIRLINE }}>
				<div className='flex flex-col min-w-0'>
					<span className='text-sm font-medium text-neutral-900 dark:text-white truncate' style={monoStyle}>
						{title || method}
					</span>
					<span className='text-xs text-neutral-500 dark:text-neutral-500'>{networkLabel}</span>
				</div>
				<button
					type='button'
					onClick={run}
					disabled={phase === 'loading'}
					onMouseEnter={() => setBtnHover(true)}
					onMouseLeave={() => setBtnHover(false)}
					className='inline-flex items-center gap-1.5 px-3 py-1.5 shrink-0 transition-colors'
					style={buttonStyle}>
					{phase === 'loading' ? <SpinnerIcon /> : <PlayIcon />}
					{phase === 'loading' ? 'Running…' : label || 'Run'}
				</button>
			</div>

			{description ? (
				<div className='px-4 pt-3 text-sm text-neutral-600 dark:text-neutral-400'>{description}</div>
			) : null}

			<div className='px-4 pt-3 pb-1'>
				<span className={labelClass}>Request</span>
			</div>
			<pre className={preClass} style={codeStyle}>
				{requestJson}
			</pre>

			{phase === 'success' ? (
				<div className='border-t' style={{ borderTopColor: HAIRLINE }}>
					<div className='flex items-center justify-between px-4 pt-3 pb-1'>
						<span className={labelClass}>Response{elapsed != null ? ` · ${elapsed} ms` : ''}</span>
						<button
							type='button'
							onClick={copyResult}
							className='text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors'>
							{copied ? 'Copied' : 'Copy'}
						</button>
					</div>
					<pre className={preClass} style={codeStyle}>
						{resultString}
					</pre>
					{decoded ? (
						<div className='px-4 pb-3 text-xs text-neutral-500 dark:text-neutral-500' style={monoStyle}>
							= {decoded} (decimal)
						</div>
					) : null}
				</div>
			) : null}

			{phase === 'error' ? (
				<div className='border-t' style={{ borderTopColor: HAIRLINE }}>
					<div className='px-4 pt-3 pb-1'>
						<span className={labelClass}>Error</span>
					</div>
					<pre className={`${preClass} text-red-600 dark:text-red-400`} style={codeStyle}>
						{errorMsg}
					</pre>
				</div>
			) : null}
		</div>
	);
};
