let color = '#ffffff';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
});
