import { log } from "console"
import { Button, Checkbox, Group, ScrollArea, Stack, Text } from "@mantine/core"
import { it } from "node:test"
import { useEffect, useState } from "react"

import { ThemeProvider } from "~theme"

enum Settings {
  IncludeSubdomains = "includeSubdomains",
  FromAllWindows = "fromAllWindows"
}

function IndexPopup() {
  const [settings, setSettings] = useState<string[]>([])
  const [tabGroups, setTabGroups] = useState({})

  function getTabs(): Promise<chrome.tabs.Tab[]> {
    const queryInfo = settings.includes(Settings.FromAllWindows)
      ? {}
      : { currentWindow: true }
    return chrome.tabs.query(queryInfo)
  }

  function getTabGroups(tabs: chrome.tabs.Tab[]) {
    const domains = {}
    const includeSubdomains = settings.includes(Settings.IncludeSubdomains)

    for (const tab of tabs) {
      if (
        tab.url.startsWith("chrome:") ||
        tab.url.startsWith("chrome-extension://")
      )
        continue

      const url = new URL(tab.url)
      const hostname = includeSubdomains
        ? url.hostname
        : url.hostname.split(".").slice(-2).join(".")

      if (!domains[hostname]) domains[hostname] = []

      domains[hostname].push(tab.id)
    }

    return domains
  }

  function groupTabs(domain: string) {
    const tabsToGroup = tabGroups[domain]
    chrome.tabs.group({ tabIds: tabsToGroup }).then((tabGroupId) => {
      chrome.tabGroups.update(tabGroupId, { title: domain }).then(() => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError)
        }
      })
    })
  }

  useEffect(() => {
    getTabs().then((tabs) => setTabGroups(getTabGroups(tabs)))
  }, [settings])

  function ButtonList(props) {
    const { items } = props

    const sortedItems = items.sort((a, b) => {
      const aCount = tabGroups[a] ? tabGroups[a].length : 0
      const bCount = tabGroups[b] ? tabGroups[b].length : 0
      return bCount - aCount
    })

    const listItems = sortedItems.map((item, i) => (
      <Button
        key={i}
        variant="default"
        onClick={(event) => {
          event.preventDefault()
          groupTabs(item)
        }}>
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

        <Checkbox.Group label="Options" value={settings} onChange={setSettings}>
          <Group mt="xs">
            <Checkbox
              value={Settings.IncludeSubdomains}
              label="Include subdomains"
            />
            <Checkbox
              value={Settings.FromAllWindows}
              label="From all windows"
            />
          </Group>
        </Checkbox.Group>

        <ButtonList items={Object.keys(tabGroups)} />
      </Stack>
    </ThemeProvider>
  )
}

export default IndexPopup
