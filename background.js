let color = '#ffffff';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Paste to EmailsEmotions", 
    contexts:["selection"], 
    id: CONTEXT_MENU_ID
  });
});

const CONTEXT_MENU_ID = "EMAIL_EMOTIONS_ID";

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }

  chrome.storage.local.set({savedWord: info.selectionText});
})
