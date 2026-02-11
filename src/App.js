// src/App.js
import React from "react";
import "./App.css";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
//import { CallProvider } from "./context/CallContext";

function App() {
  return (
    <CallProvider>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </CallProvider>
  );
}

export default App;
