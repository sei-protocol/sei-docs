import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { notFound } from 'next/navigation';
import { useMDXComponents as getMDXComponents } from '../../mdx-components';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

export async function generateMetadata(props) {
	const params = await props.params;
	if (Array.isArray(params?.mdxPath) && params.mdxPath[0] === '.well-known') {
		return {};
	}
	try {
		const { metadata } = await importPage(params.mdxPath);
		return metadata;
	} catch {
		return {};
	}

	const siteUrl = 'https://docs.sei.io';
	const path = Array.isArray(params?.mdxPath) && params.mdxPath.length > 0 ? `/${params.mdxPath.join('/')}` : '/';
	const frontmatterCanonical = metadata?.canonical;
	const canonicalUrl = frontmatterCanonical
		? frontmatterCanonical.startsWith('http')
			? frontmatterCanonical
			: `${siteUrl}${frontmatterCanonical}`
		: `${siteUrl}${path}`;

	const noindex = Boolean(metadata?.noindex);

	return {
		...metadata,
		alternates: {
			...(metadata?.alternates ?? {}),
			canonical: canonicalUrl
		},
		openGraph: {
			...(metadata?.openGraph ?? {}),
			url: canonicalUrl
		},
		robots: noindex
			? {
					index: false,
					follow: false,
					googleBot: { index: false, follow: false }
				}
			: metadata?.robots
	};
}

const Wrapper = getMDXComponents().wrapper;

export default async function Page(props) {
	const params = await props.params;
	if (Array.isArray(params?.mdxPath) && params.mdxPath[0] === '.well-known') {
		notFound();
	}
	let result;
	try {
		result = await importPage(params.mdxPath);
	} catch {
		notFound();
	}
	const { default: MDXContent, toc, metadata } = result;

	const siteUrl = 'https://docs.sei.io';
	const path = Array.isArray(params?.mdxPath) && params.mdxPath.length > 0 ? `/${params.mdxPath.join('/')}` : '/';
	const canonicalUrl = metadata?.canonical ? (metadata.canonical.startsWith('http') ? metadata.canonical : `${siteUrl}${metadata.canonical}`) : `${siteUrl}${path}`;

	const toTitleCase = (segment) =>
		segment
			.split('-')
			.map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
			.join(' ');

	const segments = Array.isArray(params?.mdxPath) ? params.mdxPath : [];

	const breadcrumbItems = [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: siteUrl + '/'
		},
		...segments.map((seg, idx) => {
			const href = `${siteUrl}/${segments.slice(0, idx + 1).join('/')}`;
			const isLast = idx === segments.length - 1;
			return {
				'@type': 'ListItem',
				position: idx + 2,
				name: isLast && metadata?.title ? metadata.title : toTitleCase(seg),
				item: href
			};
		})
	];

	const toISO8601WithTZ = (value) => {
		if (!value) return undefined;
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
				return `${value}T00:00:00Z`;
			}
			return undefined;
		}
		return date.toISOString();
	};

	const authorJson = metadata?.author
		? typeof metadata.author === 'string'
			? { '@type': 'Person', name: metadata.author }
			: metadata.author
		: { '@type': 'Organization', name: 'Sei Network', url: 'https://sei.io' };

	const techArticleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: metadata?.title ?? 'Sei Documentation',
		description: metadata?.description ?? 'Documentation for Sei Network',
		url: canonicalUrl,
		inLanguage: 'en',
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
		author: authorJson,
		datePublished: toISO8601WithTZ(metadata?.date),
		dateModified: toISO8601WithTZ(metadata?.updated ?? metadata?.date),
		image: metadata?.image ? (metadata.image.startsWith('http') ? metadata.image : `${siteUrl}${metadata.image}`) : `${siteUrl}/assets/docs-banner.png`,
		publisher: {
			'@type': 'Organization',
			name: 'Sei Network',
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/icon.png`
			}
		}
	};

	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbItems
	};

	return (
		<Wrapper toc={toc} metadata={metadata}>
			<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }} />
			<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
			<MDXContent {...props} params={params} />
		</Wrapper>
	);
}
