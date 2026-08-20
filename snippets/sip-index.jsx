export const SipIndex = () => {
	const REPO = 'sei-protocol/sips';
	const BRANCH = 'main';
	const LIST_URL = `https://api.github.com/repos/${REPO}/contents/sips?ref=${BRANCH}`;
	// Suffix is bumped whenever parseSip's output shape changes, so a cached
	// entry from an older build is discarded instead of rendered.
	const CACHE_KEY = 'sei-sip-index-v1';
	const CACHE_TTL = 3600000;
	// Highest sip-N.md the fallback path will look for.
	const MAX_PROBE = 40;

	const rawUrl = (file) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/sips/${file}`;
	const blobUrl = (file) => `https://github.com/${REPO}/blob/${BRANCH}/sips/${file}`;

	// --- Header-field parsing -------------------------------------------------
	// Each SIP opens with a two-column markdown table. Field names drifted
	// between SIPs ("SIP-Number" vs "SIP Number", "Comments" vs "Comments-URI",
	// "Author" vs "Authors"), so keys are normalized to bare alphanumerics.
	const normKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

	const pick = (meta, ...keys) => {
		for (const key of keys) {
			const value = meta[normKey(key)];
			if (value) return value;
		}
		return '';
	};

	// Turn a table cell into plain text: `<br>` becomes a separator, markdown
	// links collapse to their label, and contact emails are dropped so the
	// Author row reads as names rather than mailto noise.
	const toPlainText = (value) =>
		value
			.replace(/<br\s*\/?>/gi, ', ')
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.replace(/\\([[\]])/g, '$1')
			.replace(/\[[^\]]*@[^\]]*\]/g, '')
			.replace(/`/g, '')
			.replace(/\s+/g, ' ')
			.replace(/\s+,/g, ',')
			.replace(/[,\s]+$/, '')
			.trim();

	const firstUrl = (value) => {
		const match = value.match(/https?:\/\/[^\s)|]+/);
		return match ? match[0] : '';
	};

	// GitHub builds heading anchors by lowercasing the rendered text, dropping
	// punctuation and mapping whitespace to hyphens. Mirroring that lets the
	// outline deep-link straight into the source file. Letters and digits are
	// matched by Unicode property so accented headings keep their characters,
	// and underscores survive because GitHub keeps them in snake_case names.
	const slugify = (text) =>
		text
			.toLowerCase()
			.replace(/[^\p{L}\p{N}_\s-]/gu, '')
			.trim()
			.replace(/\s/g, '-');

	// Reduce a heading to the text GitHub would render, since the anchor is
	// derived from that rather than from the markdown source.
	const headingText = (markdown) =>
		markdown
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.replace(/\*\*/g, '')
			.replace(/\*/g, '')
			.replace(/`/g, '')
			.trim();

	const parseSip = (file, raw) => {
		const number = Number((file.match(/sip-(\d+)\.md$/i) || [])[1]);
		// Null-prototype maps: field names and heading slugs come from the SIP
		// text, so a heading like "Constructor" must not collide with
		// Object.prototype members.
		const meta = Object.create(null);

		// Several SIPs contain further tables in their body (editor registers,
		// parameter lists). Only the block above the first section heading is
		// the proposal header, so metadata parsing stops there.
		const header = raw.split(/^##\s/m)[0];

		for (const line of header.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed.startsWith('|')) continue;
			// The closing pipe is optional in GitHub-flavored markdown, so drop
			// it only when present rather than requiring it.
			const cells = trimmed.slice(1).split('|');
			if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
			if (cells.length < 2) continue;
			const key = cells[0].trim();
			const value = cells.slice(1).join('|').trim();
			// Skip the table's alignment row (| ----- | :---- |).
			if (/^:?-{2,}:?$/.test(key)) continue;
			if (!key || meta[normKey(key)]) continue;
			meta[normKey(key)] = value;
		}

		const headline = (header.match(/^\s*\*\*SIP[-\s]?\d+:\s*(.+?)\*\*/m) || [])[1];
		const title = toPlainText(headline || pick(meta, 'Title') || file);

		const seen = Object.create(null);
		const sections = [];
		// Fenced blocks can contain lines that look like headings (SIP-1's format
		// section quotes a template), and those produce anchors GitHub never
		// renders, so strip the fences before scanning.
		const prose = raw.replace(/^```[\s\S]*?^```/gm, '');
		const headingPattern = /^(#{2,4})\s+(.+?)\s*$/gm;
		let match;
		while ((match = headingPattern.exec(prose)) !== null) {
			const text = headingText(match[2]);
			if (!text) continue;
			let anchor = slugify(text);
			// GitHub disambiguates repeated headings with a numeric suffix.
			if (seen[anchor] !== undefined) {
				seen[anchor] += 1;
				anchor = `${anchor}-${seen[anchor]}`;
			} else {
				seen[anchor] = 0;
			}
			sections.push({ level: match[1].length, text, anchor });
		}

		const type = toPlainText(pick(meta, 'Type'));
		const category = toPlainText(pick(meta, 'Category'));

		return {
			number,
			file,
			title,
			description: toPlainText(pick(meta, 'Description')),
			// SIP-3/4/5 fold the category into Type as "Standard (Core)"; SIP-2
			// keeps it in its own row. Present both the same way.
			type: type && category && !type.includes(category) ? `${type} (${category})` : type || category,
			status: toPlainText(pick(meta, 'Status')) || 'Unknown',
			author: toPlainText(pick(meta, 'Author', 'Authors')),
			reviewer: toPlainText(pick(meta, 'Reviewer', 'Editor')),
			created: toPlainText(pick(meta, 'Created')),
			discussion: firstUrl(pick(meta, 'Comments', 'Comments-URI', 'CommentsURI')),
			sections
		};
	};

	// --- Data loading ---------------------------------------------------------
	const [sips, setSips] = useState([]);
	const [state, setState] = useState('loading');

	useEffect(() => {
		let cancelled = false;

		const readCache = () => {
			try {
				const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
				if (cached && Date.now() - cached.time < CACHE_TTL && Array.isArray(cached.sips)) {
					return cached.sips;
				}
			} catch {
				// Corrupt or unavailable storage just means we fetch again.
			}
			return null;
		};

		// Fetch and parse one file, returning null instead of throwing so a
		// single failure never takes down the whole listing.
		const readSip = async (file) => {
			try {
				const res = await fetch(rawUrl(file));
				if (!res.ok) return null;
				return parseSip(file, await res.text());
			} catch {
				return null;
			}
		};

		// Primary path: one directory listing, then the files it names.
		const loadFromApi = async () => {
			const res = await fetch(LIST_URL, { headers: { Accept: 'application/vnd.github+json' } });
			if (!res.ok) throw new Error(`GitHub API ${res.status}`);
			const files = (await res.json()).filter((entry) => entry.type === 'file' && /^sip-\d+\.md$/i.test(entry.name)).map((entry) => entry.name);
			if (!files.length) throw new Error('No SIP files listed');
			// One unreadable file should cost that single card, not send the whole
			// listing down the fallback path and refetch everything.
			const fetched = await Promise.all(files.map(readSip));
			const parsed = fetched.filter(Boolean);
			if (!parsed.length) throw new Error('No SIP files could be read');
			return parsed;
		};

		// Fallback for when the unauthenticated API quota is exhausted: probe
		// sip-1.md through sip-40.md on the raw CDN. Every number is requested
		// so a withdrawn or reserved number cannot truncate the index the way
		// stopping after a run of misses would.
		const loadByProbing = async () => {
			const numbers = Array.from({ length: MAX_PROBE }, (_, i) => i + 1);
			const fetched = await Promise.all(numbers.map((n) => readSip(`sip-${n}.md`)));
			const found = fetched.filter(Boolean);
			if (!found.length) throw new Error('No SIPs reachable');
			return found;
		};

		const cached = readCache();
		if (cached) {
			setSips(cached);
			setState('ready');
			return;
		}

		loadFromApi()
			.catch(loadByProbing)
			.then((parsed) => {
				if (cancelled) return;
				const ordered = parsed.sort((a, b) => a.number - b.number);
				setSips(ordered);
				setState('ready');
				try {
					localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), sips: ordered }));
				} catch {
					// Cache is an optimization; ignore quota or privacy-mode errors.
				}
			})
			.catch(() => {
				if (cancelled) return;
				setState('error');
			});

		return () => {
			cancelled = true;
		};
	}, []);

	// --- Theming --------------------------------------------------------------
	// Mintlify serves a prebuilt stylesheet, so Tailwind utilities that appear
	// only inside a snippet aren't guaranteed to exist in it. Variants carrying
	// an opacity modifier (`dark:bg-neutral-900/40`) drop out that way, which is
	// what left these cards white on a black page. The other data snippets here
	// watch the `dark` class on <html> and style inline from the style.css
	// tokens instead, so this follows the same approach.
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		const sync = () => setIsDark(root.classList.contains('dark'));
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(root, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	}, []);

	const byMode = (light, dark) => (isDark ? dark : light);

	const theme = {
		cardBg: byMode('var(--sei-card-bg-light)', 'var(--sei-card-bg-dark)'),
		border: byMode('var(--sei-card-border-light)', 'var(--sei-card-border-dark)'),
		strong: byMode('var(--sei-grey-600)', 'var(--sei-white)'),
		body: byMode('var(--sei-grey-300)', 'var(--sei-grey-50)'),
		muted: byMode('var(--sei-grey-200)', 'var(--sei-grey-75)'),
		label: byMode('var(--sei-gold-100)', 'var(--sei-gold-25)'),
		accent: byMode('var(--sei-maroon-100)', 'var(--sei-maroon-25)'),
		hoverBg: byMode('rgba(96, 0, 20, 0.02)', 'rgba(96, 0, 20, 0.08)'),
		hoverBorder: byMode('rgba(96, 0, 20, 0.35)', 'rgba(185, 155, 161, 0.25)')
	};

	// Tones map the SIP-1 lifecycle onto the Sei palette: gold while a proposal
	// is still moving, green once accepted or shipped, grey for dormant states,
	// red for withdrawn. These mirror the style.css tokens as literal hex
	// because each badge tints its own fill, and the alpha channels can't be
	// derived from a var() reference. `--sei-live` and `--sei-error` are pitched
	// for dark surfaces and drop under 2:1 as text on white, so light mode takes
	// a darkened counterpart.
	const TONES = {
		live: byMode('#1a7a00', '#38df00'),
		error: byMode('#c20a00', '#fa0c00'),
		gold: byMode('#966f22', '#d6c9ac'),
		maroon: byMode('#600014', '#b99ba1'),
		grey: byMode('#666666', '#999999')
	};

	const STATUS_TONES = {
		idea: 'grey',
		draft: 'gold',
		review: 'gold',
		'fast track': 'gold',
		'last call': 'gold',
		final: 'live',
		implemented: 'live',
		activated: 'live',
		living: 'maroon',
		stagnant: 'grey',
		withdrawn: 'error'
	};

	const channels = (hex) => {
		const n = parseInt(hex.slice(1), 16);
		return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
	};

	const eyebrow = {
		fontFamily: 'var(--sei-font-mono)',
		fontSize: '10px',
		letterSpacing: '0.04em',
		textTransform: 'uppercase'
	};

	const statusStyle = (status) => {
		const hex = TONES[STATUS_TONES[status.toLowerCase()] || 'grey'];
		const rgb = channels(hex);
		return {
			...eyebrow,
			color: hex,
			backgroundColor: `rgba(${rgb}, ${byMode(0.09, 0.14)})`,
			border: `1px solid rgba(${rgb}, ${byMode(0.28, 0.32)})`,
			borderRadius: 'var(--sei-radius-sm)',
			padding: '3px 6px',
			whiteSpace: 'nowrap'
		};
	};

	const cardStyle = {
		background: theme.cardBg,
		border: `1px solid ${theme.border}`,
		borderRadius: 'var(--sei-radius-sm)',
		padding: '20px'
	};

	const buttonStyle = {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
		padding: '6px 12px',
		fontFamily: 'var(--sei-font-mono)',
		fontSize: '12px',
		letterSpacing: '0.02em',
		color: theme.strong,
		background: 'transparent',
		border: `1px solid ${theme.border}`,
		borderRadius: 'var(--sei-radius-sm)',
		textDecoration: 'none',
		transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease'
	};

	// Inline styles can't express :hover, so the maroon card hover from
	// style.css is reproduced with handlers.
	const hoverSwap = (hovering) => (event) => {
		event.currentTarget.style.backgroundColor = hovering ? theme.hoverBg : 'transparent';
		event.currentTarget.style.borderColor = hovering ? theme.hoverBorder : theme.border;
		event.currentTarget.style.color = hovering ? theme.accent : theme.strong;
	};

	const tintSwap = (hovering) => (event) => {
		event.currentTarget.style.color = hovering ? theme.accent : theme.body;
	};

	const ExternalLinkIcon = () => (
		<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<path d="M15 3h6v6" />
			<path d="M10 14 21 3" />
		</svg>
	);

	const Field = ({ label, value }) =>
		value ? (
			<div>
				<div style={{ ...eyebrow, color: theme.label, marginBottom: '3px' }}>{label}</div>
				<div style={{ fontSize: '14px', color: theme.body }}>{value}</div>
			</div>
		) : null;

	const statusMessage = { ...cardStyle, fontSize: '14px', color: theme.body };

	if (state === 'loading') {
		return (
			<div className="not-prose" style={statusMessage}>
				Loading proposals from <code style={{ fontFamily: 'var(--sei-font-mono)' }}>{REPO}</code>…
			</div>
		);
	}

	if (state === 'error') {
		return (
			<div className="not-prose" style={statusMessage}>
				Could not reach the SIPs repository. Browse the proposals directly at{' '}
				<a
					href={`https://github.com/${REPO}/tree/${BRANCH}/sips`}
					target="_blank"
					rel="noopener noreferrer"
					style={{ color: theme.accent }}
				>
					github.com/{REPO}
				</a>
				.
			</div>
		);
	}

	return (
		<div className="not-prose" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			{sips.map((sip) => (
				<div key={sip.number} style={cardStyle}>
					<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
						<span
							style={{
								...eyebrow,
								fontSize: '11px',
								color: 'var(--sei-white)',
								backgroundColor: 'var(--sei-maroon-100)',
								borderRadius: 'var(--sei-radius-sm)',
								padding: '3px 7px'
							}}
						>
							SIP-{sip.number}
						</span>
						<span style={statusStyle(sip.status)}>{sip.status}</span>
						{sip.type ? <span style={{ fontSize: '12px', color: theme.muted }}>{sip.type}</span> : null}
					</div>

					<h3
						style={{
							fontFamily: 'var(--sei-font-display)',
							fontSize: '18px',
							fontWeight: 600,
							letterSpacing: '-0.01em',
							color: theme.strong,
							margin: '14px 0 0'
						}}
					>
						{sip.title}
					</h3>

					{sip.description ? (
						<p style={{ fontSize: '14px', lineHeight: 1.6, color: theme.body, margin: '6px 0 0' }}>{sip.description}</p>
					) : null}

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
							gap: '12px',
							marginTop: '16px'
						}}
					>
						<Field label="Author" value={sip.author} />
						<Field label="Reviewer" value={sip.reviewer} />
						<Field label="Created" value={sip.created} />
					</div>

					{/* style.css frames every <details> as the shared accordion with
					    !important, so the outline is inset by the summary's own 16px
					    padding rather than given a competing border here. */}
					{sip.sections.length ? (
						<details style={{ marginTop: '16px' }}>
							<summary style={{ fontSize: '13px', color: theme.body }}>
								Contents ({sip.sections.length} sections)
							</summary>
							<ul style={{ listStyle: 'none', margin: 0, padding: '0 16px 12px' }}>
								{sip.sections.map((section) => (
									<li key={section.anchor} style={{ paddingLeft: `${(section.level - 2) * 16}px`, margin: '4px 0' }}>
										<a
											href={`${blobUrl(sip.file)}#${section.anchor}`}
											target="_blank"
											rel="noopener noreferrer"
											style={{ fontSize: '13px', color: theme.body, textDecoration: 'none', transition: 'color 0.15s ease' }}
											onMouseEnter={tintSwap(true)}
											onMouseLeave={tintSwap(false)}
										>
											{section.text}
										</a>
									</li>
								))}
							</ul>
						</details>
					) : null}

					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
						<a
							href={blobUrl(sip.file)}
							target="_blank"
							rel="noopener noreferrer"
							style={buttonStyle}
							onMouseEnter={hoverSwap(true)}
							onMouseLeave={hoverSwap(false)}
						>
							Read SIP-{sip.number} <ExternalLinkIcon />
						</a>
						{sip.discussion ? (
							<a
								href={sip.discussion}
								target="_blank"
								rel="noopener noreferrer"
								style={buttonStyle}
								onMouseEnter={hoverSwap(true)}
								onMouseLeave={hoverSwap(false)}
							>
								Discussion <ExternalLinkIcon />
							</a>
						) : null}
					</div>
				</div>
			))}

			<p style={{ fontSize: '12px', color: theme.muted, margin: 0 }}>
				Pulled live from{' '}
				<a
					href={`https://github.com/${REPO}/tree/${BRANCH}/sips`}
					target="_blank"
					rel="noopener noreferrer"
					style={{ color: theme.accent }}
				>
					{REPO}
				</a>
				. Statuses and metadata reflect the {BRANCH} branch.
			</p>
		</div>
	);
};
