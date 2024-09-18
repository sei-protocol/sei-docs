import { Flex, Title } from '@mantine/core';
import { Button } from 'nextra/components';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { useData } from 'nextra/data';
import { filterModuleRoutes } from './utils';
import { APIEndpoint, APIModule } from '../index';
import openapi from '../../data/cosmos-openapi.json';

export const PageTitle = () => {
	const { title } = useData();
	return <NextSeo title={title} />;
};

export const getStaticPaths = () => {
	// Generate static paths for both the full routes and parent routes
	const routes = Object.keys(openapi.paths).map((p) => {
		const route = p.split('/').filter((s) => s);
		return route;
	});
	const paths = routes.flatMap((route) => {
		const fullRoute = { params: { route } };
		const parentRoutes = [];
		for (let i = 1; i < route.length; i++) {
			parentRoutes.push({ params: { route: route.slice(0, i) } });
		}
		return [fullRoute, ...parentRoutes];
	});
	const uniquePaths = Array.from(new Set(paths.map((path) => JSON.stringify(path)))).map((path) => JSON.parse(path));
	return {
		paths: uniquePaths,
		fallback: false
	};
};

export const getStaticProps = async ({ params }) => {
	const { route } = params;
	const title = `Cosmos API - ${route.join('/')}`;
	return {
		props: {
			ssg: {
				route,
				title
			}
		}
	};
};

const APIEndpointRoute = () => {
	const data = useData();
	if (!data?.route?.length) {
		return null;
	}

	const { route } = data;
	const moduleRoutes = filterModuleRoutes(Object.entries(openapi.paths), route);
	const splitRoutes = moduleRoutes?.[0]?.[0].split('/');

	if (route.length === 2) {
		return (
			<Flex direction={'column'} gap='md'>
				<Link href={`/endpoints/cosmos#${splitRoutes[1]}`}>
					<Button>Back</Button>
				</Link>

				<Title order={1} mb='xl'>
					{route.join('/')}
				</Title>
				<APIModule prefix={route.join('/')} basePaths={moduleRoutes.map((route) => route[0])} />
			</Flex>
		);
	}

	return <APIEndpoint endpoint={moduleRoutes[0]} />;
};

export default APIEndpointRoute;
