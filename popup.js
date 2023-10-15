document.addEventListener("DOMContentLoaded", function () {
  const includeSubdomainsCheckbox =
    document.getElementById("includeSubdomains");
  const domainList = document.getElementById("domainList");
  const groupTabsCurrentButton = document.getElementById("groupTabsCurrent");
  const groupTabsAllButton = document.getElementById("groupTabsAll");

  // Get all tabs in the current window
  function getCurrentWindowTabs(callback) {
    chrome.tabs.query({ currentWindow: true }, callback);
  }

  // Get all tabs in all windows
  function getAllTabs(callback) {
    chrome.tabs.query({}, callback);
  }

  // Group tabs by domain
  function groupTabs(tabs) {
    const domains = {};
    const includeSubdomains = includeSubdomainsCheckbox.checked;

    for (const tab of tabs) {
      const url = new URL(tab.url);
      const hostname = includeSubdomains
        ? url.hostname
        : url.hostname.split(".").slice(-2).join(".");

      if (!domains[hostname]) {
        domains[hostname] = [];
      }

      domains[hostname].push(tab.id);
    }

    return domains;
  }

  // Add domain buttons to the popup
  function renderDomainButtons(domains) {
    domainList.innerHTML = "";

    for (const domain in domains) {
      const button = document.createElement("button");
      button.textContent = domain;
      button.addEventListener("click", () => groupTabsByDomain(domain));
      domainList.appendChild(button);
    }
  }

  // Group tabs by domain
  function groupTabsByDomain(domain) {
    const includeSubdomains = includeSubdomainsCheckbox.checked;
    getCurrentWindowTabs((tabs) => {
      const tabsToGroup = tabs.filter((tab) => {
        const tabDomain = new URL(tab.url).hostname;
        return includeSubdomains
          ? tabDomain === domain
          : tabDomain.includes(domain);
      });

      const tabIds = tabsToGroup.map((tab) => tab.id);

      if (tabIds.length > 0) {
        // chrome.tabs.group({ tabIds: tabIds }, (groupInfo) => {
        //   chrome.tabGroups.update(groupInfo.id, { title: domain });
        // });
        chrome.tabs.group({ tabIds: tabIds }, (tabGroupId) => {
          // Set the group title
          // chrome.tabGroups.update(tabGroupId, { title: domain });
          chrome.tabGroups.update(tabGroupId, { title: domain }, () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        });
      }
    });
  }

  // Event listeners for grouping
  groupTabsCurrentButton.addEventListener("click", () => {
    getCurrentWindowTabs((tabs) => {
      const domains = groupTabs(tabs);
      renderDomainButtons(domains);
    });
  });

  groupTabsAllButton.addEventListener("click", () => {
    getAllTabs((tabs) => {
      const domains = groupTabs(tabs);
      renderDomainButtons(domains);
    });
  });
});
