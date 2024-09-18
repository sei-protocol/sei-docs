import { createTheme, MantineProvider } from '@mantine/core';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

const mantineTheme = createTheme({
	autoContrast: true
});

const MantineWrapper = ({ children }) => {
	const { resolvedTheme } = useTheme();

	const colorScheme = useMemo(() => {
		switch (resolvedTheme) {
			case 'dark':
				return 'dark';
			case 'light':
				return 'light';
			default:
				return undefined;
		}
	}, [resolvedTheme]);

	return (
		<MantineProvider theme={mantineTheme} forceColorScheme={colorScheme}>
			{children}
		</MantineProvider>
	);
};

export default MantineWrapper;
