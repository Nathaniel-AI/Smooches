import { createRoot } from "react-dom/client";
import { useState } from "react";
import App from "./App";
import SmoochesSimpleApp from "./SmoochesSimpleApp";
import "./index.css";

// Wrapper component to choose between apps
function AppSwitcher() {
  const [useSimpleApp, setUseSimpleApp] = useState(() => {
    // Check localStorage or URL param for preference
    return window.location.search.includes('simple=true');
  });
  
  if (useSimpleApp) {
    return (
      <div>
        <div className="fixed top-2 right-2 z-50">
          <button 
            onClick={() => setUseSimpleApp(false)}
            className="bg-pink-600 text-white px-4 py-2 rounded text-sm shadow-md hover:bg-pink-700"
          >
            Switch to Full App
          </button>
        </div>
        <SmoochesSimpleApp />
      </div>
    );
  }
  
  return (
    <div>
      <div className="fixed top-2 right-2 z-50">
        <button 
          onClick={() => setUseSimpleApp(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded text-sm shadow-md hover:bg-pink-700"
        >
          Switch to Simple App
        </button>
      </div>
      <App />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<AppSwitcher />);
