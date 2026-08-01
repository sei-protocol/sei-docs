export const SipIndex = () => {
	const REPO = 'sei-protocol/sips';
	const BRANCH = 'main';
	const LIST_URL = `https://api.github.com/repos/${REPO}/contents/sips?ref=${BRANCH}`;
	const CACHE_KEY = 'sei-sip-index';
	const CACHE_TTL = 3600000;

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
	// outline deep-link straight into the source file.
	const slugify = (text) =>
		text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.trim()
			.replace(/\s/g, '-');

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
			const row = line.match(/^\s*\|([^|]+)\|(.*)\|\s*$/);
			if (!row) continue;
			const key = row[1].trim();
			const value = row[2].replace(/\|\s*$/, '').trim();
			// Skip the table's alignment row (| ----- | :---- |).
			if (/^:?-{2,}:?$/.test(key)) continue;
			if (!key || meta[normKey(key)]) continue;
			meta[normKey(key)] = value;
		}

		const headline = (header.match(/^\s*\*\*SIP[-\s]?\d+:\s*(.+?)\*\*/m) || [])[1];
		const title = toPlainText(headline || pick(meta, 'Title') || file);

		const seen = Object.create(null);
		const sections = [];
		const headingPattern = /^(#{2,4})\s+(.+?)\s*$/gm;
		let match;
		while ((match = headingPattern.exec(raw)) !== null) {
			const text = match[2].replace(/\*\*/g, '').replace(/`/g, '').trim();
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

		// Primary path: one directory listing, then the files it names.
		const loadFromApi = async () => {
			const res = await fetch(LIST_URL, { headers: { Accept: 'application/vnd.github+json' } });
			if (!res.ok) throw new Error(`GitHub API ${res.status}`);
			const files = (await res.json()).filter((entry) => entry.type === 'file' && /^sip-\d+\.md$/i.test(entry.name)).map((entry) => entry.name);
			if (!files.length) throw new Error('No SIP files listed');
			return Promise.all(
				files.map(async (file) => {
					const fileRes = await fetch(rawUrl(file));
					if (!fileRes.ok) throw new Error(`${file}: ${fileRes.status}`);
					return parseSip(file, await fileRes.text());
				})
			);
		};

		// Fallback for when the unauthenticated API quota is exhausted: walk
		// sip-1.md upwards off the raw CDN and stop after a run of misses.
		const loadByProbing = async () => {
			const found = [];
			let misses = 0;
			for (let n = 1; n <= 40 && misses < 3; n++) {
				const file = `sip-${n}.md`;
				try {
					const res = await fetch(rawUrl(file));
					if (res.ok) {
						found.push(parseSip(file, await res.text()));
						misses = 0;
					} else {
						misses += 1;
					}
				} catch {
					misses += 1;
				}
			}
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

	// --- Presentation ---------------------------------------------------------
	// Colors follow the SIP-1 lifecycle: in-progress states are neutral/amber,
	// accepted and shipped states are green, ended states are muted or red.
	const statusStyles = {
		idea: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
		draft: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
		review: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
		'fast track': 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
		'last call': 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
		final: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
		implemented: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
		activated: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
		living: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
		stagnant: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
		withdrawn: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'
	};

	const statusClass = (status) => statusStyles[status.toLowerCase()] || statusStyles.idea;

	const cardClass = 'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-5';
	const linkClass =
		'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium no-underline transition-colors ' +
		'bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-100 ' +
		'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700';

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
				<div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500">{label}</div>
				<div className="text-sm text-neutral-800 dark:text-neutral-200">{value}</div>
			</div>
		) : null;

	if (state === 'loading') {
		return (
			<div className={`${cardClass} not-prose text-sm text-neutral-600 dark:text-neutral-400`}>
				Loading proposals from{' '}
				<code style={{ fontFamily: 'var(--sei-font-mono)' }}>
					{REPO}
				</code>
				…
			</div>
		);
	}

	if (state === 'error') {
		return (
			<div className={`${cardClass} not-prose text-sm text-neutral-600 dark:text-neutral-400`}>
				Could not reach the SIPs repository. Browse the proposals directly at{' '}
				<a href={`https://github.com/${REPO}/tree/${BRANCH}/sips`} target="_blank" rel="noopener noreferrer">
					github.com/{REPO}
				</a>
				.
			</div>
		);
	}

	return (
		<div className="not-prose flex flex-col gap-4">
			{sips.map((sip) => (
				<div key={sip.number} className={cardClass}>
					<div className="flex flex-wrap items-center gap-2">
						<span className="rounded-md px-2 py-0.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--sei-maroon-100, #600014)', fontFamily: 'var(--sei-font-mono)' }}>
							SIP-{sip.number}
						</span>
						<span className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusClass(sip.status)}`}>{sip.status}</span>
						{sip.type ? <span className="text-xs text-neutral-500 dark:text-neutral-400">{sip.type}</span> : null}
					</div>

					<h3 className="mt-3 mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{sip.title}</h3>

					{sip.description ? <p className="mt-0 mb-4 text-sm text-neutral-600 dark:text-neutral-400">{sip.description}</p> : null}

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<Field label="Author" value={sip.author} />
						<Field label="Reviewer" value={sip.reviewer} />
						<Field label="Created" value={sip.created} />
					</div>

					{sip.sections.length ? (
						<details className="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-800">
							<summary className="cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300">Contents ({sip.sections.length} sections)</summary>
							<ul className="mt-3 mb-0 list-none space-y-1 pl-0">
								{sip.sections.map((section) => (
									<li key={section.anchor} style={{ paddingLeft: `${(section.level - 2) * 16}px` }}>
										<a href={`${blobUrl(sip.file)}#${section.anchor}`} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
											{section.text}
										</a>
									</li>
								))}
							</ul>
						</details>
					) : null}

					<div className="mt-4 flex flex-wrap gap-2">
						<a href={blobUrl(sip.file)} target="_blank" rel="noopener noreferrer" className={linkClass}>
							Read SIP-{sip.number} <ExternalLinkIcon />
						</a>
						{sip.discussion ? (
							<a href={sip.discussion} target="_blank" rel="noopener noreferrer" className={linkClass}>
								Discussion <ExternalLinkIcon />
							</a>
						) : null}
					</div>
				</div>
			))}

			<p className="mt-0 text-xs text-neutral-500 dark:text-neutral-500">
				Pulled live from{' '}
				<a href={`https://github.com/${REPO}/tree/${BRANCH}/sips`} target="_blank" rel="noopener noreferrer">
					{REPO}
				</a>
				. Statuses and metadata reflect the {BRANCH} branch.
			</p>
		</div>
	);
};
