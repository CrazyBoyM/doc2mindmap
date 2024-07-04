chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateMindmap",
    title: "🥬 生成当页思维导图",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateMindmap") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openMindmap") {
    chrome.tabs.create({ url: chrome.runtime.getURL('markmap.html') }, (newTab) => {
      chrome.storage.local.set({ mindmapTabId: newTab.id });
    });
  } else if (message.action === "updateMindmap") {
    chrome.storage.local.get('mindmapTabId', (data) => {
      if (data.mindmapTabId) {
        chrome.tabs.sendMessage(data.mindmapTabId, { action: "updateContent", content: message.content });
      }
    });
  }
});