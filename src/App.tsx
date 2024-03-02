import { Image } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import './App.css';

function App() {
  const [tabList, setTabList] = useState<chrome.tabs.Tab[]>([]);

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
          setTabList((prev) => {
            // if new tab is opened
            if (prev.length < tabs.length) return prev.concat([tabs.find((t) => t.id === _tabId)!]);
            // if tab is updated
            return prev.map((tab) =>
              tab.id === _tabId ? tabs.find((t) => t.id === _tabId)! : tab
            );
          });
        });
      }
    };
    const onTabsRemoved = (_tabId: number) => {
      setTabList((prev) => prev?.filter((tab) => tab.id !== _tabId));
    };
    const onTabsActived = (activeInfo: { tabId: number; windowId: number }) => {
      tabs.query({ currentWindow: true }, () => {
        setTabList((prev) =>
          prev.map((tab) => {
            tab.active = false;
            if (tab.id === activeInfo.tabId) tab.active = true;
            return tab;
          })
        );
      });
    };

    tabs.onRemoved.addListener(onTabsRemoved);
    tabs.onUpdated.addListener(onTabsUpdated);
    tabs.onActivated.addListener(onTabsActived);

    return () => {
      tabs.onUpdated.removeListener(onTabsUpdated);
      tabs.onRemoved.removeListener(onTabsRemoved);
      tabs.onActivated.removeListener(onTabsActived);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tabList!);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTabList(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="p-2 h-lvh w-lvw flex flex-col items-center text-slate-50 bg-[#3B3B3B] overflow-y-auto"
          >
            {tabList?.map((tab, index) => (
              <Draggable key={tab.id!.toString()} draggableId={tab.id!.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-11/12`}
                    onClick={() => changeActiveTab(tab.id!)}
                  >
                    <motion.li
                      className={`flex select-none flex-row items-center rounded-md mb-1 p-2 wrapper hover:bg-[#454545] ${
                        tab.active ? 'bg-[#4D4D4D] shadow-md shadow-slate-950' : ''
                      }`}
                      whileHover={{ scale: 1.11 }}
                      whileTap={{ scale: 1.05 }}
                    >
                      <Image
                        alt="nextui logo"
                        height={18}
                        radius="sm"
                        src={tab.favIconUrl}
                        width={18}
                      />
                      <div
                        className={`flex-1 mx-2 overflow-hidden text-ellipsis cursor-grab ${tab.active ? '' : 'text-blur'}`}
                      >
                        {tab.title}
                      </div>
                      <div className="close" onClick={() => removeTab(tab.id!)}></div>
                    </motion.li>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default App;
