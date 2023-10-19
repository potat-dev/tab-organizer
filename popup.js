document.addEventListener("DOMContentLoaded", function () {
  const includeSubdomainsCheckbox =
    document.getElementById("includeSubdomains");
  const groupInAllWindowsCheckbox =
    document.getElementById("groupInAllWindows");
  const domainList = document.getElementById("domainList");

  // Function to get all tabs based on checkboxes' state
  function getAllTabsBasedOnCheckboxes(callback) {
    const queryInfo = groupInAllWindowsCheckbox.checked
      ? {} // All windows
      : { currentWindow: true }; // Current window only
    chrome.tabs.query(queryInfo, callback);
  }

  // Group tabs by domain
  function groupTabs(tabs) {
    const domains = {};
    const includeSubdomains = includeSubdomainsCheckbox.checked;

    for (const tab of tabs) {
      if (
        !tab.url.startsWith("chrome-extension://") &&
        !tab.url.startsWith("chrome://")
      ) {
        const url = new URL(tab.url);
        const hostname = includeSubdomains
          ? url.hostname
          : url.hostname.split(".").slice(-2).join(".");

        if (!domains[hostname]) {
          domains[hostname] = [];
        }

        domains[hostname].push(tab.id);
      }
    }

    return domains;
  }

  // Function to render domain buttons based on checkboxes' state
  function renderDomainButtons() {
    getAllTabsBasedOnCheckboxes((tabs) => {
      const domains = groupTabs(tabs);
      domainList.innerHTML = "";

      for (const domain in domains) {
        const button = document.createElement("button");
        button.textContent = domain;
        button.addEventListener("click", () => groupTabsByDomain(domain));
        domainList.appendChild(button);
      }
    });
  }

  // Group tabs by domain
  function groupTabsByDomain(domain) {
    const includeSubdomains = includeSubdomainsCheckbox.checked;
    getAllTabsBasedOnCheckboxes((tabs) => {
      const tabsToGroup = tabs.filter((tab) => {
        const tabDomain = new URL(tab.url).hostname;
        return includeSubdomains
          ? tabDomain === domain
          : tabDomain.includes(domain);
      });

      const tabIds = tabsToGroup.map((tab) => tab.id);

      if (tabIds.length > 0) {
        chrome.tabs.group({ tabIds: tabIds }, (tabGroupId) => {
          chrome.tabGroups.update(tabGroupId, { title: domain }, () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        });
      }
    });
  }

  // Event listeners for checkboxes
  includeSubdomainsCheckbox.addEventListener("change", renderDomainButtons);
  groupInAllWindowsCheckbox.addEventListener("change", renderDomainButtons);

  // Initial rendering of domain buttons
  renderDomainButtons();
});
