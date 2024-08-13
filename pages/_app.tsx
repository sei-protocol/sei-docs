import '../styles/globals.css';
import '../styles/custom.css';
import '@rainbow-me/rainbowkit/styles.css';
import {ThemeProvider} from 'next-themes';
import '@mantine/core/styles.css';
import {MantineWrapper} from "../components/MantineWrapper";
import {AskCookbook} from "../components/AskCookbook";

export default function Nextra({ Component, pageProps }) {
    return (
        <ThemeProvider attribute="class">
            <MantineWrapper>
                <Component {...pageProps} />
            </MantineWrapper>
            <AskCookbook />
        </ThemeProvider>

  );
}
