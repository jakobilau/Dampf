import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { SocketProvider } from "./socket/SocketProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
<AuthProvider>
  <SocketProvider>
    <App />
  </SocketProvider>
</AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);