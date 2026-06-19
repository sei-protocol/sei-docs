export const EcosystemAppGrid = (props) => {
	const category = props.category;

	// --- Static config: inlined verbatim from lib/ecosystemData.ts ---
	const ECOSYSTEM_API_URL = 'https://app-api.seinetwork.io/sanity/ecosystem';

	// --- Integration-guide overrides ---
	const integrationGuideOverrides = {
		'The Graph': '/evm/indexer-providers/the-graph',
		Covalent: '/evm/indexer-providers/goldrush',
		Goldsky: '/evm/indexer-providers/goldsky',
		Alchemy: '/evm/indexer-providers/alchemy'
	};

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

	// --- Data fetching (ported from lib/useEcosystemData.ts; module-level
	//     cache is not allowed in a snippet, so this lives in component state) ---
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetch(ECOSYSTEM_API_URL, { headers: { Accept: 'application/json' } })
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((json) => {
				if (cancelled) return;
				setData(Array.isArray(json && json.data) ? json.data : []);
				setIsLoading(false);
			})
			.catch(() => {
				if (cancelled) return;
				// Distinguish a failed load from an empty catalog so we don't
				// render "No integrations published yet" during an outage.
				setHasError(true);
				setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	// --- Inline icons (the shared '../Icon' component is unavailable) ---
	const WorldIcon = ({ size = 24, style }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			style={style}
			aria-hidden='true'>
			<circle cx='12' cy='12' r='9' />
			<path d='M3 12h18' />
			<path d='M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18' />
		</svg>
	);

	const ExternalLinkIcon = ({ size = 14, style }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			style={style}
			aria-hidden='true'>
			<path d='M15 3h6v6' />
			<path d='M10 14L21 3' />
			<path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
		</svg>
	);

	// Site-relative integration guides get an in-page arrow instead of the
	// off-site box-arrow, so on-docs links don't masquerade as external ones.
	const ArrowRightIcon = ({ size = 14, style }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			style={style}
			aria-hidden='true'>
			<path d='M5 12h14' />
			<path d='M12 5l7 7-7 7' />
		</svg>
	);

	// --- Skeleton card (ported from AppCardSkeleton.tsx) ---
	const AppCardSkeleton = () => (
		<div className='animate-pulse border backdrop-blur-sm bg-neutral-50/80 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-800/50 p-5 h-full flex flex-col'>
			<div className='flex flex-col gap-4'>
				<div className='w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded' />
				<div className='flex flex-col gap-2'>
					<div className='h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded' />
					<div className='h-4 w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded' />
					<div className='h-4 w-2/3 bg-neutral-200/70 dark:bg-neutral-800/70 rounded' />
				</div>
				<div className='h-4 w-28 bg-neutral-200/50 dark:bg-neutral-800/50 rounded mt-auto pt-2' />
			</div>
		</div>
	);

	// --- App card ---
	// Created once via a lazy initializer so its component identity is stable
	// across parent re-renders. EcosystemAppGrid re-renders whenever the
	// MutationObserver toggles `isDark`; if AppCard were redeclared on every
	// render, React would see a new component type and remount every card —
	// resetting hover state and reloading the logo <img> tiles. `isDark` is
	// passed in as a prop so theme changes still reach the card. (Mintlify
	// snippets can't hoist this to module scope — see mintlify-jsx-snippet-rules.)
	const [AppCard] = useState(() => ({ app, isDark }) => {
		const [hover, setHover] = useState(false);
		const [linkHover, setLinkHover] = useState(false);

		const fieldData = app.fieldData;
		const appName = fieldData.name;
		const logo = fieldData.logo;
		const desc = fieldData['short-description'];
		const integration = fieldData['integration-guide-link'];
		const logoUrl = logo && logo.url;

		// Cards skip rendering if an app has no logo (matches source).
		if (!logoUrl) return null;

		const finalIntegrationLink = integrationGuideOverrides[appName] || integration;
		const isExternalLink = finalIntegrationLink && !finalIntegrationLink.startsWith('/');
		const linkText = isExternalLink ? 'Documentation' : 'Integration Guide';

		// Internal links stay site-relative on docs.sei.io (no origin prefix).
		const resolvedLink = finalIntegrationLink ? finalIntegrationLink : undefined;

		// --- Theme-aware brand colors (replace former sei-* Tailwind classes) ---
		const titleColor = hover
			? isDark
				? 'var(--sei-maroon-25)'
				: 'var(--sei-maroon-200)'
			: undefined;

		const linkColor = isDark
			? linkHover
				? 'var(--sei-cream)'
				: 'var(--sei-maroon-25)'
			: 'var(--sei-maroon-200)';

		// Decorative group-hover gradient overlay reproduced with rgba of the
		// maroon brand color (custom-color gradients can't be a Tailwind class).
		const maroonRgb = isDark ? '96, 0, 20' : '52, 5, 13';
		const decorativeGradient = `linear-gradient(to right, rgba(${maroonRgb}, 0.15), rgba(${maroonRgb}, 0.1), rgba(${maroonRgb}, 0.15))`;

		// Logo tile tint on hover (group-hover:bg-sei-maroon-*).
		const logoTileBg = hover ? `rgba(${maroonRgb}, ${isDark ? 0.2 : 0.1})` : undefined;

		return (
			<div
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				className='group relative overflow-hidden transition-all duration-300 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 border backdrop-blur-sm bg-neutral-50/80 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-800/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 p-5 h-full flex flex-col'>
				{/* Neutral white sheen overlay (kept as standard Tailwind). */}
				<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none' />

				{/* Decorative maroon-tinted glow (custom color via inline style). */}
				<div
					className='absolute inset-0 transition-all duration-700 blur-sm -z-10 transform scale-105 pointer-events-none'
					style={{ background: decorativeGradient, opacity: hover ? 1 : 0 }}
				/>

				<div className='flex flex-col gap-4 relative z-10'>
					<div className='flex items-start justify-between'>
						<figure
							className='w-12 h-12 overflow-hidden flex-shrink-0 bg-neutral-200/50 dark:bg-neutral-800/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center'
							style={{ backgroundColor: logoTileBg }}>
							{logoUrl ? (
								<img
									src={logoUrl}
									alt={appName || ''}
									width={48}
									height={48}
									className='object-cover w-full h-full transform transition-all duration-300 group-hover:scale-110'
								/>
							) : (
								<WorldIcon
									size={24}
									style={{ color: hover ? 'var(--sei-maroon-100)' : '#737373', transition: 'color 0.3s' }}
								/>
							)}
						</figure>
					</div>

					<div className='flex flex-col gap-2 flex-grow'>
						<h3
							className='text-base font-bold text-neutral-800 dark:text-neutral-200 transition-colors duration-300 leading-tight'
							style={{ color: titleColor }}>
							{appName}
						</h3>
						{desc && <p className='text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2 flex-grow'>{desc}</p>}
					</div>

					{resolvedLink && (
						<div className='flex items-center mt-auto pt-2'>
							<a
								href={resolvedLink}
								target={isExternalLink ? '_blank' : undefined}
								rel={isExternalLink ? 'noopener noreferrer' : undefined}
								onMouseEnter={() => setLinkHover(true)}
								onMouseLeave={() => setLinkHover(false)}
								style={{ color: linkColor, transition: 'color 0.2s' }}
								className='inline-flex items-center gap-1.5 text-sm font-medium no-underline'>
								<span>{linkText}</span>
								{isExternalLink ? (
									<ExternalLinkIcon
										size={14}
										style={{ marginLeft: linkHover ? '0.25rem' : 0, transform: linkHover ? 'scale(1.1)' : 'none', transition: 'all 0.3s' }}
									/>
								) : (
									<ArrowRightIcon
										size={14}
										style={{ transform: linkHover ? 'translateX(0.25rem)' : 'none', transition: 'transform 0.3s' }}
									/>
								)}
							</a>
						</div>
					)}

					{/* Bottom hover accent line (maroon via inline style). */}
					<div
						className='w-full h-0.5 transition-opacity duration-300'
						style={{
							background: `linear-gradient(to right, transparent, rgba(${maroonRgb}, 0.2), transparent)`,
							opacity: hover ? 1 : 0
						}}
					/>
				</div>
			</div>
		);
	});

	// --- Loading state: 4 skeleton cards ---
	if (isLoading) {
		return (
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2'>
				{Array.from({ length: 4 }).map((_, i) => (
					<AppCardSkeleton key={`skeleton-${i}`} />
				))}
			</div>
		);
	}

	if (hasError) {
		return (
			<div className='py-10 text-sm text-neutral-500 dark:text-neutral-400 italic'>
				Couldn’t load {category} integrations right now. Please refresh to try again.
			</div>
		);
	}

	const apps = data.filter((app) => app && app.fieldData && app.fieldData['docs-category'] === category);

	if (!apps || apps.length === 0) {
		return <div className='py-10 text-sm text-neutral-500 dark:text-neutral-400 italic'>No {category} integrations published yet.</div>;
	}

	return (
		// `sei-eco-grid` is a non-utility marker so style.css can reset the logo
		// <figure>/<img> — Mintlify's prose injects !important margins + a rounded
		// class on content images, which otherwise stops the logo from filling
		// its tile the way the original widget does.
		<div className='sei-eco-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2'>
			{apps.map((app) => (
				<AppCard key={app.id} app={app} isDark={isDark} />
			))}
		</div>
	);
};
