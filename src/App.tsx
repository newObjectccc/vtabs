import { Image } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tabList, setTabList] = useState<chrome.tabs.Tab[]>();

  const changeActiveTab = (tabId: number) => {
    chrome.tabs.update(tabId, { active: true });
  };

  const removeTab = (tabId: number) => {
    chrome.tabs.remove(tabId);
  };

  useEffect(() => {
    const tabs = chrome.tabs;
    tabs.query({ currentWindow: true }, (tabs) => {
      setTabList(tabs);
    });

    const onTabsUpdated = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete') {
        tabs.query({ currentWindow: true }, (tabs) => {
          setTabList(tabs);
        });
      }
    };
    const onTabsRemoved = (_tabId: number) => {
      setTabList((prev) => prev?.filter((tab) => tab.id !== _tabId));
    };
    const onTabsActived = () => {
      tabs.query({ currentWindow: true }, (tabs) => {
        setTabList(tabs);
      });
    };

    tabs.onRemoved.addListener(onTabsRemoved);
    tabs.onUpdated.addListener(onTabsUpdated);
    tabs.onActivated.addListener(onTabsActived);

    return () => {
      tabs.onUpdated.removeListener(onTabsUpdated);
      tabs.onRemoved.removeListener(onTabsRemoved);
    };
  }, []);

  return (
    <ul className="p-2 h-lvh w-lvw text-slate-50 bg-[#3B3B3B]">
      {tabList?.map((tab) => (
        <li
          className={`flex flex-row items-center flex-1 rounded-md mb-1 p-2 hover:bg-[#454545] ${tab.active ? 'bg-[#4D4D4D] shadow-md shadow-slate-950' : ''}`}
          onClick={() => changeActiveTab(tab.id!)}
        >
          <Image alt="nextui logo" height={18} radius="sm" src={tab.favIconUrl} width={18} />
          <div className={`ml-2 flex-1 pr-2 cursor-default ${tab.active ? '' : 'text-blur'}`}>
            {tab.title}
          </div>
          <div className="close" onClick={() => removeTab(tab.id!)}></div>
        </li>
      ))}
    </ul>
  );
}

export default App;
