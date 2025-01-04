import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

const MantineWrapper = ({ children }) => {
  const { resolvedTheme } = useTheme();

  const mantineTheme: MantineThemeOverride = useMemo(() => {
    return {
      primaryColor: 'red',
      colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light',
      components: {
        Button: {
          styles: (theme) => ({
            root: {
              '&:hover': {
                backgroundColor: theme.colors.red[7],
              },
            },
          }),
        },
      },
    };
  }, [resolvedTheme]);

  return (
    <MantineProvider theme={mantineTheme}>
      {children}
    </MantineProvider>
  );
};

export default MantineWrapper;
