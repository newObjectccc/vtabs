/* eslint-disable no-undef */

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
  chrome.windows.getCurrent(function (window) {
    chrome.windows.update(window.id, { state: 'fullscreen' });
  });
});
