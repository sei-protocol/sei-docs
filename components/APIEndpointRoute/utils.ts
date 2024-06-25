import { ApiPathEntry } from './types';

export const filterModuleRoutes = (paths: ApiPathEntry[], filters: string[]) => {
	return paths.filter((path) => {
		if (!path[0]) return false;
		let parts = path[0].split('/');
		for (let i = 0; i < filters.length; i++) {
			if (parts[i + 1] !== filters[i]) {
				return false;
			}
		}
		return true;
	});
};
