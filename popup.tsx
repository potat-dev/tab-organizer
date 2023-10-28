import { Button, Checkbox, Group, Stack, Text } from "@mantine/core"
import { useState } from "react"

import { ThemeProvider } from "~theme"

function IndexPopup() {
  const [data, setData] = useState([
    "youtube.com",
    "google.com",
    "facebook.com"
  ])

  function ButtonList(props) {
    const { items } = props
    const listItems = items.map((item, i) => (
      <Button variant="default" key={i}>
        {item}
      </Button>
    ))

    return <Button.Group orientation="vertical">{listItems}</Button.Group>
  }

  return (
    <ThemeProvider withNormalizeCSS withGlobalStyles>
      <Stack miw={240} p="lg">
        <Text fw="bold" size="xl">
          Tab organizer ✨
        </Text>

        <Checkbox.Group defaultValue={["react"]} label="Options">
          <Group mt="xs">
            <Checkbox value="subd" label="Include subdomain" />
            <Checkbox value="allw" label="From all windows" />
          </Group>
        </Checkbox.Group>

        <ButtonList items={data} />
      </Stack>
    </ThemeProvider>
  )
}

export default IndexPopup
