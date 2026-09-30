import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applySettings, readCachedSettings } from "./preferences";

applySettings(readCachedSettings());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
