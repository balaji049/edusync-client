import React from "react";
import "./App.css";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import { CallProvider } from "./context/CallContext";
import Navbar from "./components/Navbar"; // 🔥 MISSING IMPORT FIXED

function App() {
  return (
    <CallProvider>
      <Navbar />          {/* 🔥 MUST BE HERE */}
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </CallProvider>
  );
}

export default App;
