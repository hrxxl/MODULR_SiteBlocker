// background.js — SiteBlock Service Worker

const RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "xmlhttprequest",
  "script",
  "stylesheet",
  "image",
  "font",
  "media",
  "websocket",
  "other"
];

async function syncRules() {
  const data = await chrome.storage.local.get(["sites", "masterEnabled"]);
  const sites = data.sites || [];
  const masterEnabled = data.masterEnabled !== false;

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map((r) => r.id);

  const newRules = [];
  if (masterEnabled) {
    sites.forEach((site, index) => {
      if (site.enabled) {
        newRules.push({
          id: index + 1,
          priority: 1,
          action: { type: "block" },
          condition: {
            requestDomains: [site.domain],
            resourceTypes: RESOURCE_TYPES
          }
        });
      }
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: newRules
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SYNC_RULES") {
    syncRules()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open for async
  }
  if (message.type === "GET_RULE_COUNT") {
    chrome.declarativeNetRequest
      .getDynamicRules()
      .then((rules) => sendResponse({ count: rules.length }))
      .catch(() => sendResponse({ count: 0 }));
    return true;
  }
});

// Sync on startup
chrome.runtime.onInstalled.addListener(syncRules);
chrome.runtime.onStartup.addListener(syncRules);
