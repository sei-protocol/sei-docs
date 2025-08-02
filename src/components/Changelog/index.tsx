'use client';
import { useEffect, useState } from 'react';
import { Callout } from 'nextra/components';

export function RemoteChangelog() {
	const [state, setState] = useState({
		content: '',
		lastUpdated: '',
		error: null,
		loading: true,
		isClient: false
	});

	useEffect(() => {
		setState((prev) => ({ ...prev, isClient: true }));
	}, []);

	useEffect(() => {
		if (!state.isClient) return;

		const loadChangelog = async () => {
			try {
				console.log('Starting to fetch changelog...');

				// Get content first
				const response = await fetch('https://raw.githubusercontent.com/sei-protocol/sei-chain/main/CHANGELOG.md');
				if (!response.ok) {
					throw new Error(`Failed to fetch: ${response.status}`);
				}
				const content = await response.text();
				console.log('Content fetched successfully, length:', content.length);

				// Try to get real last modified date
				let lastUpdate = new Date().toLocaleDateString();

				try {
					console.log('Trying to get commit date...');
					const commitResponse = await fetch('https://api.github.com/repos/sei-protocol/sei-chain/commits?path=CHANGELOG.md&per_page=1');

					if (commitResponse.ok) {
						const commitData = await commitResponse.json();
						console.log('Commit response:', commitData);

						if (commitData && commitData.length > 0) {
							const commitDate = new Date(commitData[0].commit.author.date);
							lastUpdate = commitDate.toLocaleDateString();
							console.log('Got real commit date:', lastUpdate);
						}
					} else {
						console.log('Commit API failed with status:', commitResponse.status);
					}
				} catch (err) {
					console.log('Commit fetch error:', err.message);
				}

				setState((prev) => ({
					...prev,
					content,
					lastUpdated: lastUpdate,
					loading: false,
					error: null
				}));
			} catch (error) {
				console.error('Error loading changelog:', error);
				setState((prev) => ({
					...prev,
					error: error.message,
					loading: false
				}));
			}
		};

		loadChangelog();
	}, [state.isClient]);

	const parseContent = (rawContent) => {
		if (!rawContent) return [];

		const sections = rawContent.split(/^## /gm).slice(1);

		return sections.map((section, idx) => {
			const lines = section.split('\n');
			const version = lines[0]?.trim() || `Version ${idx + 1}`;
			const body = lines.slice(1).join('\n').trim();

			return { version, body, idx };
		});
	};

	const renderContent = (body) => {
		if (!body) {
			return <div className='text-gray-500 italic py-4'>No changes listed</div>;
		}

		// NEW: Handle markdown section headers like ### Features, ### Bug Fixes
		const sectionComponents: Array<{ name: string; changes: string }> = [];

		// Split by markdown headers (### Section Name)
		const sections = body.split(/^### /gm);

		// Process each section (skip first empty part)
		for (let i = 1; i < sections.length; i++) {
			const section = sections[i];
			const lines = section.split('\n');
			const sectionName = lines[0]?.trim();

			if (sectionName) {
				// Get all bullet points for this section
				const bulletPoints: string[] = [];

				for (let j = 1; j < lines.length; j++) {
					const line = lines[j].trim();
					if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•')) {
						// Clean up the bullet point - remove the bullet and any markdown links
						let cleanLine = line
							.replace(/^\*\s*/, '')
							.replace(/^-\s*/, '')
							.replace(/^•\s*/, '');
						// Remove markdown links but keep the text
						cleanLine = cleanLine.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
						bulletPoints.push(cleanLine);
					}
				}

				if (bulletPoints.length > 0) {
					sectionComponents.push({
						name: sectionName,
						changes: bulletPoints.join('\n* ').replace(/^\* /, '')
					});
				}
			}
		}

		if (sectionComponents.length > 0) {
			return (
				<div className='space-y-6'>
					{sectionComponents.map((comp, i) => (
						<div key={i}>
							<div className='flex items-center gap-2 mb-3'>
								<div className='flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md'>
									<div className='w-2 h-2 bg-gray-500 rounded-full'></div>
									<span className='font-medium text-gray-700 text-sm'>{comp.name}</span>
								</div>
							</div>
							<div className='space-y-2'>
								{comp.changes
									.split(/\s*\*\s+/)
									.filter((c) => c.trim())
									.map((change, j) => (
										<div key={j} className='flex items-start gap-3 py-2'>
											<span className='text-base mt-0.5 text-gray-400'>•</span>
											<div className='flex-1'>
												<TextWithLinks content={change.trim()} componentName='sei-chain' />
											</div>
										</div>
									))}
							</div>
						</div>
					))}
				</div>
			);
		}

		// Try original component pattern (for newer changelogs with sei-chain:, sei-cosmos: etc)
		const componentPattern = /^([a-zA-Z][a-zA-Z0-9-]*):?\s*$/gm;
		const componentMatches = [...body.matchAll(componentPattern)];
		const components: Array<{ name: string; changes: string }> = [];

		if (componentMatches.length > 0) {
			// Split content by component headers
			const parts = body.split(/^([a-zA-Z][a-zA-Z0-9-]*):?\s*$/gm);

			// Process the parts: [initial_content, component1_name, component1_content, component2_name, component2_content, ...]
			for (let i = 1; i < parts.length; i += 2) {
				const componentName = parts[i]?.trim().replace(':', '');
				const componentContent = parts[i + 1]?.trim();

				if (componentName && componentContent) {
					// Extract bullet points and clean up content
					const bulletPoints: string[] = [];
					const lines = componentContent.split('\n');

					for (const line of lines) {
						const trimmedLine = line.trim();
						if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
							// Clean up the bullet point
							let cleanLine = trimmedLine
								.replace(/^\*\s*/, '')
								.replace(/^-\s*/, '')
								.replace(/^•\s*/, '');
							// Remove markdown links but keep the text
							cleanLine = cleanLine.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
							bulletPoints.push(cleanLine);
						} else if (trimmedLine && !trimmedLine.match(/^[a-zA-Z][a-zA-Z0-9-]*:?\s*$/)) {
							// Include non-empty lines that aren't component headers
							bulletPoints.push(trimmedLine);
						}
					}

					if (bulletPoints.length > 0) {
						components.push({
							name: componentName,
							changes: bulletPoints.join('\n* ').replace(/^\* /, '')
						});
					}
				}
			}
		}

		// If we found components using the component pattern, use that
		if (components.length > 0) {
			return (
				<div className='space-y-6'>
					{components.map((comp, i) => (
						<div key={i}>
							<div className='flex items-center gap-2 mb-3'>
								<div className='flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md'>
									<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
									<span className='font-medium text-slate-700 text-sm'>{comp.name}</span>
								</div>
							</div>
							<div className='space-y-2'>
								{comp.changes
									.split(/\s*\*\s+/)
									.filter((c) => c.trim())
									.map((change, j) => (
										<div key={j} className='flex items-start gap-3 py-2'>
											<span className='text-base mt-0.5 text-gray-400'>•</span>
											<div className='flex-1'>
												<TextWithLinks content={change.trim()} componentName={comp.name} />
											</div>
										</div>
									))}
							</div>
						</div>
					))}
				</div>
			);
		}

		// Fallback: simple list
		const fallbackLines = body
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l);
		return (
			<div className='space-y-2'>
				{fallbackLines.map((line, i) => (
					<div key={i} className='flex items-start gap-3 py-2'>
						<span className='text-base mt-0.5 text-gray-400'>•</span>
						<div className='flex-1'>
							<TextWithLinks content={line} componentName='sei-chain' />
						</div>
					</div>
				))}
			</div>
		);
	};

	const TextWithLinks = ({ content, componentName }) => {
		if (!state.isClient || !content) {
			return <span className='text-base'>{content}</span>;
		}

		// Map component names to their respective repositories
		const getRepoUrl = (compName) => {
			const repoMap = {
				'sei-chain': 'sei-protocol/sei-chain',
				'sei-tendermint': 'sei-protocol/sei-tendermint',
				'sei-cosmos': 'sei-protocol/sei-cosmos',
				'sei-db': 'sei-protocol/sei-db',
				'sei-wasmd': 'sei-protocol/sei-wasmd',
				'sei-iavl': 'sei-protocol/sei-iavl',
				'tm-db': 'sei-protocol/tm-db'
			};

			return repoMap[compName] || 'sei-protocol/sei-chain';
		};

		// Clean up any existing markdown URLs and brackets first
		let cleanedContent = content
			.replace(/\]\(https:\/\/[^)]+\)/g, '') // Remove ](https://...)
			.replace(/\[/g, '') // Remove opening brackets
			.replace(/\]/g, ''); // Remove closing brackets

		// Handle mixed content with both PR numbers and URLs
		// Split by GitHub URLs but keep them in the results
		const urlPattern = /(https:\/\/github\.com\/[^\s)]+)/g;
		const parts = cleanedContent.split(urlPattern);

		return (
			<span className='text-base'>
				{parts.map((part, i) => {
					// Check if this part is a GitHub URL
					if (part.match(urlPattern)) {
						// Extract meaningful link text from the URL
						let linkText = part;
						if (part.includes('/compare/')) {
							const compareMatch = part.match(/\/compare\/([^\/\s]+)/);
							if (compareMatch) {
								linkText = `Compare ${compareMatch[1].replace('...', ' → ')}`;
							}
						} else if (part.includes('/releases/tag/')) {
							const tagMatch = part.match(/\/releases\/tag\/([^\/\s]+)/);
							if (tagMatch) {
								linkText = `Release ${tagMatch[1]}`;
							}
						} else if (part.includes('/pull/')) {
							const prMatch = part.match(/\/pull\/(\d+)/);
							if (prMatch) {
								linkText = `#${prMatch[1]}`;
							}
						}

						return (
							<a
								key={i}
								href={part}
								target='_blank'
								rel='noopener noreferrer'
								className='text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-mono text-sm font-medium transition-colors no-underline ml-1'>
								{linkText}
							</a>
						);
					}

					// For non-URL parts, process PR numbers and other text
					// Check for "Compare" links (like "Compare v3.9.0...v5.0.0" or "Compare sei-cosmos-2.0.42beta → v2.0.43beta-release")
					const compareMatch = part.match(
						/Compare\s+((?:sei-[a-z]+-)?(v?\d+\.\d+\.\d+(?:\.\d+)?(?:beta|alpha|rc\d*)?(?:-release)?))(?:\s*[→\-]\s*|\.\.\.)+(v?\d+\.\d+\.\d+(?:\.\d+)?(?:beta|alpha|rc\d*)?(?:-release)?)/i
					);
					if (compareMatch) {
						const [fullMatch, fromVersion, toVersion] = compareMatch;
						// Clean up the version strings - remove component prefixes like "sei-cosmos-"
						const cleanFromVersion = fromVersion.replace(/^sei-[a-z]+-/, '');
						const cleanToVersion = toVersion.replace(/^sei-[a-z]+-/, '');
						const repoPath = getRepoUrl(componentName);
						const compareUrl = `https://github.com/${repoPath}/compare/${cleanFromVersion}...${cleanToVersion}`;
						const displayText = `Compare ${cleanFromVersion} → ${cleanToVersion}`;

						return (
							<span key={i}>
								{part.replace(fullMatch, '')}
								<a
									href={compareUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-mono text-sm font-medium transition-colors no-underline ml-1'>
									{displayText}
								</a>
							</span>
						);
					}

					// Split by PR numbers and process each segment
					const prParts = part.split(/(\b\d{1,4}\b|#\d+)/g);

					return (
						<span key={i}>
							{prParts.map((subPart, j) => {
								const trimmedPart = subPart.trim();

								// Match #123 format (already has #)
								if (trimmedPart.match(/^#\d+$/)) {
									const num = trimmedPart.slice(1);

									// Check if there's an inline component reference before this PR number
									const prevParts = prParts.slice(0, j).join('');
									const inlineComponentMatch = prevParts.match(/\b(sei-chain|sei-tendermint|sei-cosmos|sei-db|sei-wasmd|sei-iavl|tm-db)\s*$/i);
									const effectiveComponent = inlineComponentMatch ? inlineComponentMatch[1] : componentName;

									const repoPath = getRepoUrl(effectiveComponent);
									return (
										<a
											key={j}
											href={`https://github.com/${repoPath}/pull/${num}`}
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-mono text-sm font-medium transition-colors no-underline ml-1'>
											#{num}
										</a>
									);
								}
								// Match standalone numbers, but only if they look like PR numbers
								else if (trimmedPart.match(/^\d{1,4}$/) && parseInt(trimmedPart) > 0) {
									const prevPart = prParts[j - 1] || '';
									const nextPart = prParts[j + 1] || '';

									// Only convert to PR link if it looks like a PR number
									const followedByNonPR = nextPart.match(/^\s*(hop|limit|version|v\d|\.\d|px|ms|s\b|mb|gb|kb)/i);
									const precededByNonPR = prevPart.match(/(v|version|\d\.)\s*$/i);
									const isLikelyPRNumber =
										(j < 3 || prevPart.includes('•') || prevPart.includes('\n') || prevPart.includes('#')) &&
										!followedByNonPR &&
										!precededByNonPR &&
										parseInt(trimmedPart) >= 10;

									if (isLikelyPRNumber) {
										const num = trimmedPart;

										// Check if there's an inline component reference before this PR number
										const prevParts = prParts.slice(0, j).join('');
										const inlineComponentMatch = prevParts.match(/\b(sei-chain|sei-tendermint|sei-cosmos|sei-db|sei-wasmd|sei-iavl|tm-db)\s*$/i);
										const effectiveComponent = inlineComponentMatch ? inlineComponentMatch[1] : componentName;

										const repoPath = getRepoUrl(effectiveComponent);
										return (
											<a
												key={j}
												href={`https://github.com/${repoPath}/pull/${num}`}
												target='_blank'
												rel='noopener noreferrer'
												className='text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-mono text-sm font-medium transition-colors no-underline mr-1'>
												#{num}
											</a>
										);
									}
								}

								return <span key={j}>{subPart}</span>;
							})}
						</span>
					);
				})}
			</span>
		);
	};

	if (!state.isClient) {
		return <div className='animate-pulse h-64 bg-gray-100 rounded'></div>;
	}

	if (state.loading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='flex items-center gap-3'>
					<div className='animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent'></div>
					<span className='text-gray-600 font-medium'>Loading changelog...</span>
				</div>
			</div>
		);
	}

	if (state.error) {
		return <Callout type='error'>Failed to load changelog: {state.error}</Callout>;
	}

	if (!state.content) {
		return <Callout type='warning'>No changelog content available.</Callout>;
	}

	const versions = parseContent(state.content);

	return (
		<div>
			<div className='flex items-center justify-between mb-2 pb-4 mt-4'>
				<span className='text-sm text-gray-500'>
					Last updated: <span className='font-medium text-gray-700'>{state.lastUpdated}</span>
				</span>
				<a
					href='https://github.com/sei-protocol/sei-chain/blob/main/CHANGELOG.md'
					target='_blank'
					rel='noopener noreferrer'
					className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors font-medium no-underline'>
					<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
						<path
							fillRule='evenodd'
							d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
							clipRule='evenodd'
						/>
					</svg>
					View on GitHub
				</a>
			</div>

			<div className='changelog-content'>
				{versions.map((version) => (
					<div key={version.idx} className='mb-8'>
						<div className='flex items-center gap-3 mb-4'>
							<h2 className='text-xl font-bold text-gray-900 m-0'>{version.version}</h2>
							<span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>Release</span>
						</div>
						<div className='space-y-4'>{renderContent(version.body)}</div>
					</div>
				))}
			</div>
		</div>
	);
}
