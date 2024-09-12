import type { MantineProviderProps } from "@mantine/core"
import { createTheme, MantineProvider } from "@mantine/core"
import type { PropsWithChildren } from "react"

const theme = createTheme({
  /** Your theme override here */
})

export function ThemeProvider({
  children,
  ...props
}: PropsWithChildren<MantineProviderProps>) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" {...props}>
      {children}
    </MantineProvider>
  )
}
