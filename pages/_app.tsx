import '../styles/globals.css';
import '../styles/custom.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ThemeProvider } from 'next-themes';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
/** Put your mantine theme override here */
});

export default function Nextra({ Component, pageProps }) {
  return (
      <MantineProvider theme={theme}>
          <ThemeProvider attribute="class">
              <Component {...pageProps} />
          </ThemeProvider>
      </MantineProvider>

  );
}
