import { APIEndpoint, APIModule } from '../index';
import { useRouter } from 'next/router';
import openapi from '../../data/cosmos-openapi.json';
import { Flex, Title } from '@mantine/core';
import { Button } from 'nextra/components';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { filterModuleRoutes } from './utils';

export const APIEndpointRoute = () => {
	const router = useRouter();
	const routes = router.query.route as string[];

	if (!routes?.[0]) return null;

	const moduleRoutes = filterModuleRoutes(Object.entries(openapi.paths), routes);

	const splitRoutes = moduleRoutes?.[0]?.[0].split('/');
	const SEO_TITLE = `Cosmos API - ${splitRoutes?.[2]} - Sei Docs`;

	if (routes.length === 2) {
		return (
			<Flex direction={'column'} gap='md'>
				<NextSeo title={SEO_TITLE}></NextSeo>

				<Link href={`/endpoints/cosmos#${splitRoutes[1]}`}>
					<Button>Back</Button>
				</Link>

				<Title order={1} mb='xl'>
					{routes.join('/')}
				</Title>
				<APIModule prefix={routes.join('/')} basePaths={moduleRoutes.map((route) => route[0])} />
			</Flex>
		);
	}

	return (
		<>
			<NextSeo title={SEO_TITLE}></NextSeo>
			<APIEndpoint endpoint={moduleRoutes[0]} />
		</>
	);
};
