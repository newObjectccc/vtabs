import { Image } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import './App.css';

function App() {
  const [tabList, setTabList] = useState<chrome.tabs.Tab[]>([]);

  const changeActiveTab = (tab: chrome.tabs.Tab) => {
    const { id } = tab;
    try {
      chrome.tabs.update(id!, { active: true });
    } catch (error) {
      const { url } = tab;
      chrome.tabs.query({ currentWindow: true, url }, (tabs) => {
        tabs.length > 0 && chrome.tabs.update(tabs[0].id!, { active: true });
      });
    }
  };

  const moveTab = (tabIds: number | number[], idx: number) => {
    const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
    chrome.tabs.move(ids, { index: idx });
  };

  const removeTab = (tabId: number, evt: React.MouseEvent) => {
    chrome.tabs.remove(tabId);
    evt.stopPropagation();
  };

  const setTabsListByQuery = () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      setTabList(tabs);
    });
  };

  const onTabsCreated = (tab: chrome.tabs.Tab) => {
    setTabList((prev) => prev.concat([tab]));
  };
  const onTabsRemoved = (tabId: number) => {
    setTabList((prev) => prev?.filter((tab) => tab.id !== tabId));
  };
  const onTabsActived = (activeInfo: { tabId: number; windowId: number }) => {
    chrome.tabs.query({ currentWindow: true }, () => {
      setTabList((prev) =>
        prev.map((tab) => {
          tab.active = false;
          if (tab.id === activeInfo.tabId) tab.active = true;
          return tab;
        })
      );
    });
  };

  useEffect(() => {
    const tabs = chrome.tabs;
    setTabsListByQuery();

    tabs.onRemoved.addListener(onTabsRemoved);
    tabs.onUpdated.addListener(setTabsListByQuery);
    tabs.onActivated.addListener(onTabsActived);
    tabs.onCreated.addListener(onTabsCreated);
    tabs.onDetached.addListener(setTabsListByQuery);
    tabs.onReplaced.addListener(setTabsListByQuery);
    tabs.onMoved.addListener(setTabsListByQuery);

    return () => {
      tabs.onRemoved.removeListener(onTabsRemoved);
      tabs.onUpdated.removeListener(setTabsListByQuery);
      tabs.onActivated.removeListener(onTabsActived);
      tabs.onCreated.removeListener(onTabsCreated);
      tabs.onDetached.removeListener(setTabsListByQuery);
      tabs.onReplaced.removeListener(setTabsListByQuery);
      tabs.onMoved.removeListener(setTabsListByQuery);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tabList!);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTabList(items);
    moveTab(reorderedItem.id!, result.destination.index);
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
                    onClick={() => changeActiveTab(tab)}
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
                      <div className="close" onClick={(evt) => removeTab(tab.id!, evt)}></div>
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
