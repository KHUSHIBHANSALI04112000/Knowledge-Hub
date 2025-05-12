import React from "react";
import ReactDOM from "react-dom/client";  // ✅ Ensure you're using client
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Use createRoot
root.render(<App />);
