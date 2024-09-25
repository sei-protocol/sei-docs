const customImageLoader = ({ src, width, quality }) => {
	// Validate width and quality parameters
	const validWidth = Number.isInteger(width) && width > 0 ? width : 800;
	const validQuality = quality && quality > 0 && quality <= 100 ? quality : 75;

	return `${src}?w=${validWidth}&q=${validQuality}`;
};

export default customImageLoader;
