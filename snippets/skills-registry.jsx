export const SkillsRegistry = () => {
	// --- Foundation skills hosted on docs.sei.io (.mintlify/skills/<id>/SKILL.md).
	//     All install together via `npx skills add docs.sei.io`. Keep this list in
	//     sync with the .mintlify/skills/ directory. ---
	const SKILLS = [
		{
			id: 'sei-contracts',
			title: 'Smart Contracts',
			domain: 'Contracts',
			href: '/evm/evm-general',
			desc: 'Foundry and Hardhat setup, the Sei gas model, OCC-aware contract design, and verifying on Seiscan via Sourcify.'
		},
		{
			id: 'sei-frontend',
			title: 'Frontend',
			domain: 'Frontend',
			href: '/evm/building-a-frontend',
			desc: 'wagmi + viem chain config, Sei Global Wallet, dual-address UX, and fast-finality patterns for 400ms blocks.'
		},
		{
			id: 'sei-precompiles',
			title: 'Precompiles',
			domain: 'Precompiles',
			href: '/evm/precompiles/example-usage',
			desc: 'Call Sei native precompiles — Bank, Staking, Governance, Oracle, and more — from Solidity and viem.'
		},
		{
			id: 'sei-nodes',
			title: 'Nodes & Validators',
			domain: 'Infrastructure',
			href: '/node',
			desc: 'Run full nodes and validators: state sync, snapshots, monitoring, and the SeiDB storage backend.'
		},
		{
			id: 'sei-payments',
			title: 'Payments',
			domain: 'Payments',
			href: '/ai/x402',
			desc: 'Accept and send payments on Sei with USDC and x402 HTTP-native micropayments.'
		},
		{
			id: 'sei-security',
			title: 'Security',
			domain: 'Security',
			href: '/evm/debugging-contracts',
			desc: 'Simulate-before-write, safe randomness, address-association checks, and AI-agent safety guardrails.'
		}
	];

	const INSTALL_CMD = 'npx skills add docs.sei.io';
	const FILTERS = ['All', 'Contracts', 'Frontend', 'Precompiles', 'Infrastructure', 'Payments', 'Security'];

	// --- Dark mode detection (Mintlify toggles a `dark` class on <html>) ---
	const [isDark, setIsDark] = useState(false);
	useEffect(() => {
		const el = document.documentElement;
		const update = () => setIsDark(el.classList.contains('dark'));
		update();
		const obs = new MutationObserver(update);
		obs.observe(el, { attributes: true, attributeFilter: ['class'] });
		return () => obs.disconnect();
	}, []);

	const [filter, setFilter] = useState('All');
	const [filterHover, setFilterHover] = useState(null);

	// --- Per-domain inline SVG icons (stateless; no images, so re-creation on
	//     render is harmless). currentColor inherits the maroon brand tint. ---
	const Icon = ({ domain, size = 22 }) => {
		const common = {
			xmlns: 'http://www.w3.org/2000/svg',
			width: size,
			height: size,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 1.8,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			'aria-hidden': true
		};
		if (domain === 'Contracts')
			return (
				<svg {...common}>
					<path d='M16 18l6-6-6-6' />
					<path d='M8 6l-6 6 6 6' />
				</svg>
			);
		if (domain === 'Frontend')
			return (
				<svg {...common}>
					<rect x='2' y='3' width='20' height='14' rx='2' />
					<path d='M8 21h8M12 17v4' />
				</svg>
			);
		if (domain === 'Precompiles')
			return (
				<svg {...common}>
					<rect x='4' y='4' width='16' height='16' rx='2' />
					<path d='M9 9h6v6H9zM2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M15 2v2M9 20v2M15 20v2' />
				</svg>
			);
		if (domain === 'Infrastructure')
			return (
				<svg {...common}>
					<rect x='2' y='4' width='20' height='6' rx='2' />
					<rect x='2' y='14' width='20' height='6' rx='2' />
					<path d='M6 7h.01M6 17h.01' />
				</svg>
			);
		if (domain === 'Payments')
			return (
				<svg {...common}>
					<rect x='2' y='5' width='20' height='14' rx='2' />
					<path d='M2 10h20' />
				</svg>
			);
		if (domain === 'Security')
			return (
				<svg {...common}>
					<path d='M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z' />
					<path d='M9 12l2 2 4-4' />
				</svg>
			);
		return (
			<svg {...common}>
				<circle cx='12' cy='12' r='9' />
			</svg>
		);
	};

	const CopyIcon = ({ size = 14 }) => (
		<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
			<rect x='9' y='9' width='13' height='13' rx='2' />
			<path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
		</svg>
	);

	const CheckIcon = ({ size = 14 }) => (
		<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
			<path d='M20 6L9 17l-5-5' />
		</svg>
	);

	const ArrowRightIcon = ({ size = 14, style }) => (
		<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={style} aria-hidden='true'>
			<path d='M5 12h14M12 5l7 7-7 7' />
		</svg>
	);

	// --- Skill card. Created once via lazy initializer so its identity is stable
	//     across parent re-renders (theme toggle / filter change), preserving the
	//     card's own hover + copy state. `isDark` arrives as a prop. See
	//     mintlify-jsx-snippet-rules. ---
	const [SkillCard] = useState(() => ({ skill, isDark }) => {
		const [hover, setHover] = useState(false);
		const [copied, setCopied] = useState(false);
		const [copyHover, setCopyHover] = useState(false);
		const [linkHover, setLinkHover] = useState(false);

		const copy = async () => {
			try {
				await navigator.clipboard.writeText(INSTALL_CMD);
				setCopied(true);
				setTimeout(() => setCopied(false), 1600);
			} catch (e) {
				/* clipboard unavailable — no-op */
			}
		};

		const accent = isDark ? 'var(--sei-maroon-25)' : 'var(--sei-maroon-100)';
		const linkColor = isDark ? (linkHover ? 'var(--sei-cream)' : 'var(--sei-maroon-25)') : 'var(--sei-maroon-100)';

		return (
			<div
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				className='flex flex-col h-full p-5 transition-all duration-200'
				style={{
					backgroundColor: hover ? 'rgba(128,128,128,0.10)' : 'rgba(128,128,128,0.05)',
					border: '1px solid rgba(128,128,128,0.20)',
					borderRadius: '12px',
					transform: hover ? 'translateY(-2px)' : 'none'
				}}>
				<div className='flex items-center gap-3 mb-3'>
					<span
						className='inline-flex items-center justify-center'
						style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isDark ? 'rgba(185,155,161,0.14)' : 'rgba(96,0,20,0.08)', color: accent, flexShrink: 0 }}>
						<Icon domain={skill.domain} />
					</span>
					<div className='flex flex-col'>
						<h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-tight' style={{ margin: 0 }}>
							{skill.title}
						</h3>
						<code className='text-xs text-neutral-500 dark:text-neutral-400' style={{ fontFamily: 'var(--sei-font-mono)' }}>
							{skill.id}
						</code>
					</div>
				</div>

				<p className='text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-grow' style={{ marginTop: 0 }}>
					{skill.desc}
				</p>

				<div className='flex items-center justify-between gap-3 mt-4'>
					<span
						className='inline-flex items-center text-xs font-medium px-2 py-0.5'
						style={{ color: accent, backgroundColor: isDark ? 'rgba(185,155,161,0.12)' : 'rgba(96,0,20,0.07)', borderRadius: 999 }}>
						{skill.domain}
					</span>
					<a
						href={skill.href}
						onMouseEnter={() => setLinkHover(true)}
						onMouseLeave={() => setLinkHover(false)}
						className='inline-flex items-center gap-1 text-sm font-medium no-underline'
						style={{ color: linkColor, transition: 'color 0.2s' }}>
						<span>View docs</span>
						<ArrowRightIcon size={13} style={{ transform: linkHover ? 'translateX(0.2rem)' : 'none', transition: 'transform 0.25s' }} />
					</a>
				</div>

				<button
					type='button'
					onClick={copy}
					onMouseEnter={() => setCopyHover(true)}
					onMouseLeave={() => setCopyHover(false)}
					className='inline-flex items-center justify-between gap-2 w-full mt-3 px-3 py-2 text-left'
					style={{
						backgroundColor: copyHover ? 'rgba(128,128,128,0.12)' : 'rgba(128,128,128,0.06)',
						border: '1px solid rgba(128,128,128,0.20)',
						borderRadius: 8,
						cursor: 'pointer'
					}}
					aria-label={`Copy install command for ${skill.id}`}>
					<code className='text-xs text-neutral-700 dark:text-neutral-300 truncate' style={{ fontFamily: 'var(--sei-font-mono)' }}>
						{INSTALL_CMD}
					</code>
					<span className='inline-flex items-center shrink-0' style={{ color: copied ? (isDark ? '#34d399' : '#059669') : accent }}>
						{copied ? <CheckIcon /> : <CopyIcon />}
					</span>
				</button>
			</div>
		);
	});

	const visible = filter === 'All' ? SKILLS : SKILLS.filter((s) => s.domain === filter);

	return (
		<div>
			{/* --- Filter pills --- */}
			<div className='flex flex-wrap gap-2 mb-6'>
				{FILTERS.map((f) => {
					const active = filter === f;
					const hovered = filterHover === f;
					return (
						<button
							key={f}
							type='button'
							onClick={() => setFilter(f)}
							onMouseEnter={() => setFilterHover(f)}
							onMouseLeave={() => setFilterHover(null)}
							className='text-sm font-medium px-3 py-1.5 transition-colors'
							style={{
								borderRadius: 999,
								cursor: 'pointer',
								color: active ? '#ffffff' : isDark ? '#d4d4d4' : '#404040',
								backgroundColor: active
									? isDark
										? 'var(--sei-maroon-100)'
										: 'var(--sei-maroon-100)'
									: hovered
									? 'rgba(128,128,128,0.14)'
									: 'rgba(128,128,128,0.07)',
								border: '1px solid rgba(128,128,128,0.20)'
							}}>
							{f}
						</button>
					);
				})}
			</div>

			{/* --- Grid --- */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
				{visible.map((skill) => (
					<SkillCard key={skill.id} skill={skill} isDark={isDark} />
				))}
			</div>

			{visible.length === 0 && <div className='py-10 text-sm text-neutral-500 dark:text-neutral-400 italic'>No skills in this category yet.</div>}
		</div>
	);
};
