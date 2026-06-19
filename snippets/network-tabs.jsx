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

	const tabButtonClass = (tab) =>
		`px-3 py-1.5 text-sm transition-colors ${
			activeTab === tab
				? 'bg-neutral-200 dark:bg-neutral-800/80 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700'
				: 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 hover:text-neutral-900 dark:hover:text-white'
		}`;

	const sectionTitleClass = 'font-medium text-neutral-900 dark:text-white';
	const statusIndicatorClass = 'w-2 h-2 rounded-full';
	const labelClass = 'text-neutral-500 dark:text-neutral-500 mb-1';
	const valueClass = 'text-neutral-700 dark:text-neutral-300';
	const linkClass = 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors';
	const visitLinkClass = 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center transition-colors';

	const renderTabContent = (tab, isVisible = true) => {
		const contentClass = isVisible ? 'tab-content' : 'sr-only';
		const ariaHidden = !isVisible;

		switch (tab) {
			case 'mainnet':
				return (
					<div key={tab} className={contentClass} aria-hidden={ariaHidden} data-search-content data-tab-value='mainnet'>
						<div className='w-full'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<div className={`${statusIndicatorClass} bg-green-500`}></div>
									<h3 className={sectionTitleClass}>EVM</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex flex-col'>
										<div className={labelClass}>Chain ID:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>1329 (0x531)</span>
											<CopyButton textToCopy='1329' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://evm-rpc.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
												https://evm-rpc.sei-apis.com
											</a>
											<CopyButton textToCopy='https://evm-rpc.sei-apis.com' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>seiscan.io</span>
											<a href='https://seiscan.io' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
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
					<div key={tab} className={contentClass} aria-hidden={ariaHidden} data-search-content data-tab-value='testnet'>
						<div className='grid grid-cols-1 gap-6 w-full'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<div className={`${statusIndicatorClass} bg-blue-500`}></div>
									<h3 className={sectionTitleClass}>EVM</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex flex-col'>
										<div className={labelClass}>Chain ID:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>1328 (0x530)</span>
											<CopyButton textToCopy='1328' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://evm-rpc-testnet.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
												https://evm-rpc-testnet.sei-apis.com
											</a>
											<CopyButton textToCopy='https://evm-rpc-testnet.sei-apis.com' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>testnet.seiscan.io</span>
											<a href='https://testnet.seiscan.io' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
												Visit
												<ChevronRightIcon className='w-4 h-4 ml-1' />
											</a>
										</div>
									</div>
									<div className='flex flex-col'>
										<div className={labelClass}>Faucet:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>Testnet faucet</span>
											<a href='https://docs.sei.io/learn/faucet' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
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
					<div key={tab} className={contentClass} aria-hidden={ariaHidden} data-search-content data-tab-value='localnet'>
						<div className='grid grid-cols-1 gap-6 w-full'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<div className={`${statusIndicatorClass} bg-purple-500`}></div>
									<h3 className={sectionTitleClass}>EVM</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex flex-col'>
										<div className={labelClass}>Chain ID:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>713714 (0xAE3F2)</span>
											<CopyButton textToCopy='713714' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>http://localhost:8545</span>
											<CopyButton textToCopy='http://localhost:8545' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>N/A</span>
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
				<button type='button' onClick={() => selectTab('mainnet')} className={tabButtonClass('mainnet')}>
					Mainnet (pacific-1)
				</button>
				<button type='button' onClick={() => selectTab('testnet')} className={tabButtonClass('testnet')}>
					Testnet (atlantic-2)
				</button>
				<button type='button' onClick={() => selectTab('localnet')} className={tabButtonClass('localnet')}>
					Local Environment
				</button>
			</div>

			{renderTabContent(activeTab, true)}

			{['mainnet', 'testnet', 'localnet'].map((tab) => (tab !== activeTab ? renderTabContent(tab, false) : null))}
		</div>
	);
};
