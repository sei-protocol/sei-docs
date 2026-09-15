// ThemeAwareIframe chooses the docs theme before loading a third-party embed.
// The resolved URL is intentionally frozen after mount: changing an iframe src
// on every theme toggle would reload the embedded app and discard reader state.
export const ThemeAwareIframe = (props) => {
	const { src, title, className, style, loading = 'lazy', allow, allowFullScreen } = props || {};
	const [frameSrc, setFrameSrc] = useState(null);

	useEffect(() => {
		if (!src) {
			setFrameSrc(null);
			return;
		}

		try {
			const url = new URL(src);
			url.searchParams.set('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
			setFrameSrc(url.toString());
		} catch {
			// Preserve the original source if a future caller supplies a URL form
			// that the browser cannot parse.
			setFrameSrc(src);
		}
	}, [src]);

	if (!frameSrc) {
		return <div className={className} style={style} aria-hidden='true' />;
	}

	return (
		<iframe
			src={frameSrc}
			title={title}
			className={className}
			style={style}
			loading={loading}
			allow={allow}
			allowFullScreen={allowFullScreen}
		/>
	);
};
