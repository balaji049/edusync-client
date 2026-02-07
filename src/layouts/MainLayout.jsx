import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
