export const NetworkTabs = (props) => {
	const { network = 'mainnet' } = props || {};

	// --- Icons (nested components) ---
	const ChevronRightIcon = ({ className }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			className={className}>
			<path d='M9 6l6 6l-6 6' />
		</svg>
	);

	const CheckIcon = ({ className }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			className={className}>
			<path d='M5 12l5 5l10 -10' />
		</svg>
	);

	const CopyIcon = ({ className }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			className={className}>
			<path d='M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z' />
			<path d='M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1' />
		</svg>
	);

	// --- CopyButton (nested component) ---
	const CopyButton = ({ textToCopy }) => {
		const [copied, setCopied] = useState(false);

		const handleCopy = () => {
			navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		};

		return (
			<button
				type='button'
				onClick={handleCopy}
				className='p-1  text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
				title='Copy to clipboard'
				aria-label='Copy to clipboard'>
				{copied ? <CheckIcon className='h-4 w-4 text-green-500' /> : <CopyIcon className='h-4 w-4' />}
			</button>
		);
	};

	const validTabs = ['mainnet', 'testnet', 'localnet'];
	const initialTab = validTabs.includes(network) ? network : 'mainnet';

	// Read the URL hash during the initial render so a deep link like
	// `#testnet` shows the right tab on the first paint, instead of rendering
	// mainnet first and only correcting it inside an effect. Guarded for any
	// non-browser (SSR) render where `window` is undefined.
	const [activeTab, setActiveTab] = useState(() => {
		if (typeof window !== 'undefined') {
			const hash = window.location.hash.substring(1);
			if (validTabs.includes(hash)) return hash;
		}
		return initialTab;
	});

	useEffect(() => {
		const handleHashChange = () => {
			const h = window.location.hash.substring(1);
			if (validTabs.includes(h)) {
				setActiveTab(h);
			}
		};

		// Re-sync once on mount (covers a hash that changed between the initial
		// render and mount) and then on every subsequent hash change.
		handleHashChange();

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	const selectTab = (tab) => {
		setActiveTab(tab);
		if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
			window.history.replaceState(null, '', `#${tab}`);
		}
	};

	// Mintlify only compiles Tailwind classes that appear literally inside a
	// `className` attribute (it rewrites them to `mint-*`). Keep utility lists
	// as direct literals; use data attributes plus style.css or inline styles
	// for conditional state. Tab surfaces use rgba hairlines so they read the
	// same on both page backgrounds.
	const [hoverTab, setHoverTab] = useState(null);

	const tabButtonStyle = (tab) => {
		const active = activeTab === tab;
		const hover = hoverTab === tab;
		return {
			backgroundColor: active ? 'rgba(128, 128, 128, 0.22)' : hover ? 'rgba(128, 128, 128, 0.16)' : 'rgba(128, 128, 128, 0.08)',
			border: `1px solid ${active ? 'rgba(128, 128, 128, 0.4)' : 'rgba(128, 128, 128, 0.22)'}`,
			cursor: 'pointer'
		};
	};

	const renderTabContent = (tab, isVisible = true) => {
		const ariaHidden = !isVisible;
		const visuallyHiddenStyle = isVisible
			? undefined
			: {
					position: 'absolute',
					width: '1px',
					height: '1px',
					padding: 0,
					margin: '-1px',
					overflow: 'hidden',
					clip: 'rect(0, 0, 0, 0)',
					whiteSpace: 'nowrap',
					borderWidth: 0
			  };

		switch (tab) {
			case 'mainnet':
				return (
					<div key={tab} className='tab-content' style={visuallyHiddenStyle} aria-hidden={ariaHidden} data-search-content data-tab-value='mainnet'>
						<div className='w-full'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<div className='w-2 h-2 rounded-full bg-green-500'></div>
									<h3 className='font-medium text-neutral-900 dark:text-white'>EVM</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Chain ID:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>1329 (0x531)</span>
											<CopyButton textToCopy='1329' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://evm-rpc.sei-apis.com' target='_blank' rel='noopener noreferrer' className='text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors'>
												https://evm-rpc.sei-apis.com
											</a>
											<CopyButton textToCopy='https://evm-rpc.sei-apis.com' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>seiscan.io</span>
											<a href='https://seiscan.io' target='_blank' rel='noopener noreferrer' className='text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center transition-colors'>
												Visit
												<ChevronRightIcon className='w-4 h-4 ml-1' />
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			case 'testnet':
				return (
					<div key={tab} className='tab-content' style={visuallyHiddenStyle} aria-hidden={ariaHidden} data-search-content data-tab-value='testnet'>
						<div className='grid grid-cols-1 gap-6 w-full'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<div className='w-2 h-2 rounded-full bg-blue-500'></div>
									<h3 className='font-medium text-neutral-900 dark:text-white'>EVM</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Chain ID:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>1328 (0x530)</span>
											<CopyButton textToCopy='1328' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://evm-rpc-testnet.sei-apis.com' target='_blank' rel='noopener noreferrer' className='text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors'>
												https://evm-rpc-testnet.sei-apis.com
											</a>
											<CopyButton textToCopy='https://evm-rpc-testnet.sei-apis.com' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>testnet.seiscan.io</span>
											<a href='https://testnet.seiscan.io' target='_blank' rel='noopener noreferrer' className='text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center transition-colors'>
												Visit
												<ChevronRightIcon className='w-4 h-4 ml-1' />
											</a>
										</div>
									</div>
									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Faucet:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>Testnet faucet</span>
											<a href='https://docs.sei.io/learn/faucet' target='_blank' rel='noopener noreferrer' className='text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center transition-colors'>
												Visit
												<ChevronRightIcon className='w-4 h-4 ml-1' />
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			case 'localnet':
				return (
					<div key={tab} className='tab-content' style={visuallyHiddenStyle} aria-hidden={ariaHidden} data-search-content data-tab-value='localnet'>
						<div className='grid grid-cols-1 gap-6 w-full'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<div className='w-2 h-2 rounded-full bg-purple-500'></div>
									<h3 className='font-medium text-neutral-900 dark:text-white'>EVM</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Chain ID:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>713714 (0xAE3F2)</span>
											<CopyButton textToCopy='713714' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>http://localhost:8545</span>
											<CopyButton textToCopy='http://localhost:8545' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className='text-neutral-600 dark:text-neutral-400 mb-1'>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className='text-neutral-700 dark:text-neutral-300'>N/A</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className='network-tabs w-full'>
			<div className='flex flex-wrap gap-2 mb-6'>
				<button
					type='button'
					onClick={() => selectTab('mainnet')}
					onMouseEnter={() => setHoverTab('mainnet')}
					onMouseLeave={() => setHoverTab(null)}
					className='sei-network-tab px-3 py-1.5 text-sm transition-colors'
					data-active={activeTab === 'mainnet'}
					style={tabButtonStyle('mainnet')}>
					Sei Mainnet
				</button>
				<button
					type='button'
					onClick={() => selectTab('testnet')}
					onMouseEnter={() => setHoverTab('testnet')}
					onMouseLeave={() => setHoverTab(null)}
					className='sei-network-tab px-3 py-1.5 text-sm transition-colors'
					data-active={activeTab === 'testnet'}
					style={tabButtonStyle('testnet')}>
					Sei Testnet
				</button>
				<button
					type='button'
					onClick={() => selectTab('localnet')}
					onMouseEnter={() => setHoverTab('localnet')}
					onMouseLeave={() => setHoverTab(null)}
					className='sei-network-tab px-3 py-1.5 text-sm transition-colors'
					data-active={activeTab === 'localnet'}
					style={tabButtonStyle('localnet')}>
					Local Environment
				</button>
			</div>

			{renderTabContent(activeTab, true)}

			{['mainnet', 'testnet', 'localnet'].map((tab) => (tab !== activeTab ? renderTabContent(tab, false) : null))}
		</div>
	);
};
