import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs';

const themeComponents = getThemeComponents();

function renderInlineCode(content) {
	if (typeof content !== 'string') {
		return content;
	}

	return content.split(/(`[^`]+`)/g).map((part, idx) => {
		if (part.startsWith('`') && part.endsWith('`')) {
			return (
				<code key={idx} className='rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'>
					{part.slice(1, -1)}
				</code>
			);
		}

		return <span key={idx}>{part}</span>;
	});
}

export function KeyValueTable({ rows = [] }) {
	return (
		<div className='not-prose mt-4 mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white/95 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80'>
			<table className='w-full border-collapse text-sm'>
				<tbody className='divide-y divide-neutral-100 dark:divide-neutral-800'>
					{rows.map(([label, value], i) => (
						<tr key={i}>
							<td className='w-full px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100 sm:w-60 sm:align-top sm:px-6'>
								{renderInlineCode(label)}
							</td>
							<td className='px-4 py-3 align-top text-sm text-neutral-600 dark:text-neutral-300 sm:px-6'>{renderInlineCode(value)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function CardGrid({ items = [] }) {
	return (
		<div className='not-prose mt-4 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
			{items.map((it, i) => (
				<a
					key={i}
					href={it.href}
					className='group rounded-lg border border-neutral-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-700'>
					<div className='text-sm font-medium text-neutral-800 transition group-hover:text-neutral-600 dark:text-neutral-100 dark:group-hover:text-neutral-200'>
						{renderInlineCode(it.title)}
					</div>
					<div className='mt-1 text-sm text-neutral-600 dark:text-neutral-300'>{renderInlineCode(it.description)}</div>
				</a>
			))}
		</div>
	);
}

export function FunctionList({ items = [] }) {
	return (
		<div className='not-prose mt-4 mb-6 overflow-x-auto'>
			<table className='w-full border-collapse text-sm'>
				<thead>
					<tr className='border-b border-neutral-200 dark:border-neutral-800'>
						<th className='px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Function</th>
						<th className='px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Description</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-200 dark:divide-neutral-800'>
					{items.map((item, idx) => (
						<tr key={idx}>
							<td className='w-1/3 px-4 py-3 align-top'>
								<div className='font-mono text-xs font-medium text-neutral-700 dark:text-neutral-300'>{item.name}</div>
								{item.signature ? <code className='mt-1 block text-[11px] text-neutral-500 dark:text-neutral-400'>{item.signature}</code> : null}
							</td>
							<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300'>{item.description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function TroubleshootingTable({ rows = [] }) {
	return (
		<div className='not-prose mt-4 mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
			<table className='w-full text-sm'>
				<thead className='border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/70'>
					<tr>
						<th className='px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Error</th>
						<th className='px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Cause</th>
						<th className='px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Fix</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-200 dark:divide-neutral-800'>
					{rows.map(([error, cause, fix], i) => (
						<tr key={i}>
							<td className='px-4 py-3 align-top'>
								<code className='text-xs text-neutral-700 dark:text-neutral-300'>{error}</code>
							</td>
							<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300'>{renderInlineCode(cause)}</td>
							<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300'>{renderInlineCode(fix)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function VersionTimeline({ releases = [] }) {
	return (
		<div className='not-prose mt-4 mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
			<table className='w-full text-sm'>
				<thead className='border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/70'>
					<tr>
						<th className='w-32 px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Version</th>
						<th className='px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400'>Changes</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-200 dark:divide-neutral-800'>
					{releases.map((release, idx) => (
						<tr key={idx}>
							<td className='px-4 py-3 align-top'>
								<a
									href={release.url}
									target='_blank'
									rel='noopener noreferrer'
									className='font-mono text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300'>
									{release.version}
								</a>
							</td>
							<td className='px-4 py-3'>
								<ul className='space-y-1 text-sm text-neutral-600 dark:text-neutral-300'>
									{release.changes.map((change, i) => {
										const parts = change.split(/(`[^`]+`)/g);
										return (
											<li key={i} className='flex items-start gap-2'>
												<span className='mt-1.5'>•</span>
												<span>
													{parts.map((part, j) =>
														part.startsWith('`') && part.endsWith('`') ? (
															<code key={j} className='rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'>
																{part.slice(1, -1)}
															</code>
														) : (
															<span key={j}>{part}</span>
														)
													)}
												</span>
											</li>
										);
									})}
								</ul>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function useMDXComponents(components) {
	return {
		...themeComponents,
		...components,
		KeyValueTable,
		CardGrid,
		FunctionList,
		TroubleshootingTable,
		VersionTimeline
	};
}
