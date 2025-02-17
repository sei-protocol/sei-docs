import { useEffect } from 'react';

export default function Set404() {
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const nextData = (window as any).__NEXT_DATA__;
			if (nextData?.props?.pageProps) {
				nextData.props.pageProps.statusCode = 404;
			}
		}
	}, []);

	return null;
}
