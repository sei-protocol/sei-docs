import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { isEqual } from 'underscore';
import { useData } from 'nextra/data';
import openapi from '../../data/cosmos-openapi.json';
import { filterModuleRoutes } from './utils';
import { APIModule, APIEndpoint } from '../index';

// Minimal skeleton loader
function Skeleton({ width, height, className }: { width: number; height: number; className?: string }) {
	return <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse mb-4 ${className}`} style={{ width: `${width}px`, height: `${height}px` }} />;
}

export const PageTitle = () => {
	const router = useRouter();
	if (router.isFallback) {
		return null;
	}
	const data = useData();
	const title = data?.title || 'API Route Not Found';
	return <NextSeo title={title} />;
};

// Gather all openapi paths
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

export default function APIEndpointRoute() {
	const router = useRouter();
	// If still loading fallback page
	if (router.isFallback) {
		return (
			<div>
				<Skeleton width={200} height={16} />
				<Skeleton width={128} height={32} />
				<Skeleton width={300} height={24} />
			</div>
		);
	}

	const data = useData();
	if (!data?.route?.length) {
		return (
			<div className='mt-8'>
				<h1 className='text-2xl font-bold mb-4'>API Route Not Found</h1>
				<p className='text-base'>The API route you were looking for could not be found.</p>
			</div>
		);
	}

	const { route } = data;
	const moduleRoutes = filterModuleRoutes(Object.entries(openapi.paths), route);
	const splitRoutes = moduleRoutes?.[0]?.[0].split('/');

	// If only 2 segments (like cosmos/bank), show module overview
	if (route.length === 2) {
		return (
			<div className='flex flex-col gap-4 mt-4'>
				<Link href={`/reference/cosmos#${splitRoutes[1]}`}>
					<a
						className='
              inline-block 
              px-4 py-2 
              text-sm 
              bg-gray-200 
              dark:bg-gray-700 
              dark:text-gray-200
              rounded 
              hover:bg-gray-300 
              dark:hover:bg-gray-600
            '>
						Back
					</a>
				</Link>

				<h1 className='text-2xl font-bold mt-2 mb-4'>{route.join('/')}</h1>
				<APIModule prefix={route.join('/')} basePaths={moduleRoutes.map((route) => route[0])} />
			</div>
		);
	}

	// Otherwise, show the single endpoint
	return <APIEndpoint endpoint={moduleRoutes[0]} />;
}
