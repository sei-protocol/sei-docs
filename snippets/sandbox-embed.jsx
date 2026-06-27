// SandboxEmbed — a click-to-load iframe wrapper for external runnable-code sandboxes.
//
// Mintlify's React runtime cannot import npm (so no @stackblitz/sdk, no Sandpack
// library) and the hosted site cannot set response headers (so no cross-origin-
// isolated WebContainers). This component therefore embeds only SELF-SUFFICIENT
// pure-iframe URLs:
//   • CodeSandbox /embed  — Tier 2: editable/runnable viem/ethers TypeScript
//   • Remix IDE           — Tier 3: Solidity compile + deploy to Sei testnet
//
// The <iframe> src is deferred until the reader clicks, so a page with several
// embeds pays nothing on load (Mintlify has no dynamic import / React.lazy).
// No `sandbox` attribute is set and `cross-origin-isolated` is intentionally
// omitted: every working iframe already in this repo (in-app-swaps, videos,
// snapshot, faucet) sets neither, and a restrictive sandbox is the most common
// cause of a blank CodeSandbox/Remix frame.
//
// Theming note: surfaces/hairlines use theme-agnostic translucent inline styles
// because Mintlify does not apply `dark:bg-*` / `dark:border-*` to custom-snippet
// container <div>s (only `dark:text-*` works).
//
// Usage in MDX:
//   import { SandboxEmbed } from '/snippets/sandbox-embed.jsx';
//
//   // Tier 2 — CodeSandbox (browser-bundled template; verify it runs anonymously)
//   <SandboxEmbed
//     kind="codesandbox"
//     src="https://codesandbox.io/embed/<id>?view=split&hidenavigation=1&theme=dark"
//     title="viem · read Sei testnet"
//     description="Edit and re-run this viem example against Sei testnet."
//   />
//
//   // Tier 3 — Remix IDE (code= must be base64URL: +/→-_, no padding)
//   <SandboxEmbed
//     kind="remix"
//     src="https://remix.ethereum.org/?#activate=solidity,fileManager&code=<base64url>"
//     title="Counter.sol · deploy to Sei testnet"
//     description="Compile in-browser, then deploy via MetaMask on Sei testnet or Remix's External HTTP Provider set to https://evm-rpc-testnet.sei-apis.com."
//   />
export const SandboxEmbed = (props) => {
	const { src, kind = 'codesandbox', title, description, height, label } = props || {};

	// --- config (kept inside the component: module-level decls crash in Mintlify) ---
	const KINDS = {
		codesandbox: { name: 'CodeSandbox', host: 'codesandbox.io', defaultHeight: 500 },
		remix: { name: 'Remix IDE', host: 'remix.ethereum.org', defaultHeight: 620 },
		stackblitz: { name: 'StackBlitz', host: 'stackblitz.com', defaultHeight: 500 }
	};
	const meta = KINDS[kind] || KINDS.codesandbox;
	// Coerce so a string height from MDX (height="600") is honored, and guard against
	// 0 / negative / NaN, which would otherwise render an invisible iframe.
	const parsedHeight = Number(height);
	const frameHeight = Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : meta.defaultHeight;

	// Permissions kept minimal. `cross-origin-isolated` is deliberately NOT
	// requested — it is inert unless the parent page is COOP/COEP isolated, which
	// Mintlify cannot configure.
	const allowAttr = 'clipboard-read; clipboard-write';

	// --- state ---
	const [loaded, setLoaded] = useState(false);
	const [btnHover, setBtnHover] = useState(false);

	// --- theme-agnostic surfaces (see theming note above) ---
	const HAIRLINE = 'rgba(128, 128, 128, 0.25)';
	const surfaceStyle = { backgroundColor: 'rgba(128, 128, 128, 0.08)' };
	const monoStyle = { fontFamily: 'var(--sei-font-mono)' };

	const cardClass = 'not-prose w-full rounded-lg border overflow-hidden my-4';
	const headerClass = 'flex items-center justify-between gap-3 px-4 py-2.5 border-b';
	const buttonStyle = {
		backgroundColor: btnHover ? 'var(--sei-maroon-200)' : 'var(--sei-maroon-100)',
		color: '#ffffff',
		fontFamily: 'var(--sei-font-mono)',
		textTransform: 'uppercase',
		letterSpacing: '0.04em',
		fontSize: '10px',
		cursor: 'pointer'
	};

	// --- icons (nested) ---
	const PlayIcon = () => (
		<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
			<path d='M8 5v14l11-7z' />
		</svg>
	);

	const ExternalIcon = () => (
		<svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
			<path d='M14 5h5v5' />
			<path d='M19 5l-9 9' />
			<path d='M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5' />
		</svg>
	);

	return (
		<div className={cardClass} style={{ borderColor: HAIRLINE }}>
			<div className={headerClass} style={{ ...surfaceStyle, borderBottomColor: HAIRLINE }}>
				<div className='flex flex-col min-w-0'>
					<span className='text-sm font-medium text-neutral-900 dark:text-white truncate' style={monoStyle}>
						{title || meta.name}
					</span>
					<span className='text-xs text-neutral-500 dark:text-neutral-500'>{meta.name}</span>
				</div>
				<div className='flex items-center gap-3 shrink-0'>
					{src ? (
						<a
							href={src}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors'>
							Open <ExternalIcon />
						</a>
					) : null}
					{!loaded && src ? (
						<button
							type='button'
							onClick={() => setLoaded(true)}
							onMouseEnter={() => setBtnHover(true)}
							onMouseLeave={() => setBtnHover(false)}
							className='inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors'
							style={buttonStyle}>
							<PlayIcon />
							{label || 'Load editor'}
						</button>
					) : null}
				</div>
			</div>

			{description ? (
				<div className='px-4 pt-3 pb-1 text-sm text-neutral-600 dark:text-neutral-400'>{description}</div>
			) : null}

			{!src ? (
				<div className='px-4 py-6 text-sm text-red-600 dark:text-red-400' style={monoStyle}>
					SandboxEmbed: missing required `src`.
				</div>
			) : loaded ? (
				<iframe
					src={src}
					title={title || meta.name}
					className='w-full block border-0'
					style={{ height: frameHeight + 'px', backgroundColor: 'rgba(128, 128, 128, 0.05)' }}
					allow={allowAttr}
					loading='lazy'
					allowFullScreen
				/>
			) : (
				<button
					type='button'
					onClick={() => setLoaded(true)}
					className='w-full flex flex-col items-center justify-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors'
					style={{ height: frameHeight + 'px', cursor: 'pointer', ...surfaceStyle }}>
					<PlayIcon />
					<span className='text-sm' style={monoStyle}>Click to load {meta.name}</span>
					<span className='text-xs'>Loads {meta.host} in an embedded editor</span>
				</button>
			)}
		</div>
	);
};
