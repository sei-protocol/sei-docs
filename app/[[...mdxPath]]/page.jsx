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
	return (
		<Wrapper toc={toc} metadata={metadata}>
			<MDXContent {...props} params={params} />
		</Wrapper>
	);
}
