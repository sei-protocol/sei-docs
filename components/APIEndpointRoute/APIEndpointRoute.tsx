import { Box, Flex, Loader, Skeleton, Stack, Text, Title } from '@mantine/core';
import { Button } from 'nextra/components';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { useData } from 'nextra/data';
import { isEqual } from 'underscore';
import { filterModuleRoutes } from './utils';
import { APIEndpoint, APIModule } from '../index';
import openapi from '../../data/cosmos-openapi.json';
import { useRouter } from 'next/router';

export const PageTitle = () => {
	const router = useRouter();
	// Check if the page is still loading
	if (router.isFallback) {
		return null;
	}
	const data = useData();
	const title = data?.title || 'API Route Not Found';
	return <NextSeo title={title} />;
};

// Generate static paths for both the full routes and parent routes
// i.e. for /cosmos/bank/v1beta1/supply, we want the routes:
// 1. cosmos/bank/v1beta1/supply
// 2. cosmos/bank
const getPaths = () => {
	const routes = Object.keys(openapi.paths).map((p) => {
		const route = p.split('/').filter((s) => s);
		return route;
	});
	const paths = routes.flatMap((route) => {
		const fullRoute = { params: { route } };
		const parentRoute = { params: { route: [route[0], route[1]] } };
		return [fullRoute, parentRoute];
	});
	const uniquePaths = Array.from(new Set(paths.map((path) => JSON.stringify(path)))).map((path) => JSON.parse(path));
	return uniquePaths;
};

export const getStaticPaths = () => {
	// Return empty path array here and just get static props on demand
	return {
		paths: [],
		fallback: true
	};
};

export const getStaticProps = async ({ params }) => {
	const { route } = params;
	const paths = getPaths();
	if (paths.some((p) => isEqual(p.params.route, route))) {
		const title = `Cosmos API - ${route.join('/')}`;
		return {
			props: {
				ssg: {
					route,
					title
				}
			}
		};
	}
	return {
		notFound: true
	};
};

const APIEndpointRoute = () => {
	const router = useRouter();
	// Check if the page is still loading
	if (router.isFallback) {
		return (
			<Box>
				<Skeleton h={16} w={200} mb='xl' />
				<Skeleton h={32} w={128} mb='xl' />
				<Skeleton h={24} />
			</Box>
		);
	}

	const data = useData();
	if (!data?.route?.length) {
		return (
			<Box>
				<Title mb='md'>API Route Not Found</Title>
				<Text>The API route you were looking for could not be found.</Text>
			</Box>
		);
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
