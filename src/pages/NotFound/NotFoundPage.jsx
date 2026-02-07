import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "64px", marginBottom: "10px" }}>404</h1>
      <p style={{ fontSize: "18px", color: "#555" }}>
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        style={{
          marginTop: "20px",
          textDecoration: "none",
          color: "#2563eb",
          fontWeight: "600",
        }}
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
