export const getUniqueSections = (paths: object, filters: string[]) => {
	const sections = new Set();

	Object.keys(paths).forEach((path) => {
		const parts = path.split('/');
		filters.map((filter) => {
			if (parts[1] === filter) {
				sections.add(parts[2]);
			}
		});
	});
	return Array.from(sections);
};
