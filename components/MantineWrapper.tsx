import {createTheme, MantineProvider} from "@mantine/core";
import {useTheme} from "next-themes";
import {useMemo} from "react";

const mantineThemeOverride = createTheme({
    autoContrast: true
});

export const MantineWrapper = ({ children }) => {
    const { theme } = useTheme()

    const mantineTheme = useMemo(() => {
        switch (theme) {
            case "dark":
                return "dark";
            case "light":
                return "light";
            default:
                return undefined;

        }
    }, [theme]);

    return (
        <MantineProvider theme={mantineThemeOverride} forceColorScheme={mantineTheme}>
            {children}
        </MantineProvider>
    )
}
