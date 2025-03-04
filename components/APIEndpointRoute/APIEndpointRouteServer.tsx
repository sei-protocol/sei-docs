import { isEqual } from 'underscore';
import openapi from '../../data/cosmos-openapi.json';

// Generate static params for both the full routes and parent routes
const getPaths = () => {
	const routes = Object.keys(openapi.paths).map((p) => {
		return p.split('/').filter((s) => s);
	});

	const paths = routes.flatMap((route) => {
		const fullRoute = { route };
		const parentRoute = { route: [route[0], route[1]] };
		return [fullRoute, parentRoute];
	});

	return Array.from(new Set(paths.map((path) => JSON.stringify(path)))).map((path) => JSON.parse(path));
};

export function generateStaticParams() {
	return getPaths();
}

// This function will be called during build time
export async function generateMetadata({ params }) {
	const { route } = params;
	if (!route) return { title: 'Cosmos API Reference' };

	const paths = getPaths();
	const routeArray = Array.isArray(route) ? route : [route];

	if (paths.some((p) => isEqual(p.route, routeArray))) {
		return {
			title: `Cosmos API - ${routeArray.join('/')}`
		};
	}

	return {
		title: 'API Route Not Found'
	};
}
