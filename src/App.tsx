import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('App rendereds', chrome.tabs);
    // test chrome api .
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      console.log('🚀 ~ chrome.tabs.query ~ tabs:', tabs);
    });
  }, []);

  return (
    <>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
