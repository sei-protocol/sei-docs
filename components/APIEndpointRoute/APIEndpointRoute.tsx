'use client';

import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { isEqual } from 'underscore';
import { filterModuleRoutes } from './utils';
import { APIEndpoint, APIModule } from '../index';
import openapi from '../../data/cosmos-openapi.json';
import { Button } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';

export const PageTitle = () => {
	const title = 'API Route Not Found';
	return <NextSeo title={title} />;
};

// Generate static paths for both the full routes and parent routes
// i.e. for /cosmos/bank/v1beta1/supply, we want the routes:
// 1. cosmos/bank/v1beta1/supply
// 2. cosmos/bank
const getPaths = () => {
	const routes = Object.keys(openapi.paths).map((p) => {
		return p.split('/').filter((s) => s);
	});

	const paths = routes.flatMap((route) => {
		const fullRoute = { params: { route } };
		const parentRoute = { params: { route: [route[0], route[1]] } };
		return [fullRoute, parentRoute];
	});

	return Array.from(new Set(paths.map((path) => JSON.stringify(path)))).map((path) => JSON.parse(path));
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
	const pathname = usePathname();
	const routes = pathname
		?.split('/')
		.filter(Boolean)
		.slice(2) // Remove `/reference/api/` prefix
		.map((route) => decodeURIComponent(route)); // URL decode

	if (!routes?.length) {
		return (
			<div className='flex flex-col gap-2'>
				<p>API Route Not Found</p>
				<p>The API route you were looking for could not be found.</p>
			</div>
		);
	}
	const moduleRoutes = filterModuleRoutes(Object.entries(openapi.paths), routes);
	const splitRoutes = moduleRoutes?.[0]?.[0].split('/');

	if (routes?.length === 2) {
		return (
			<div className='flex flex-col gap-6'>
				<Link href={`/reference/cosmos#${splitRoutes[1]}`}>
					<Button>Back</Button>
				</Link>

				<p className='text-2xl'>{routes.join('/')}</p>
				<APIModule prefix={routes.join('/')} basePaths={moduleRoutes.map((route) => route[0])} />
			</div>
		);
	}

	return <APIEndpoint endpoint={moduleRoutes[0]} />;
};

export default APIEndpointRoute;
