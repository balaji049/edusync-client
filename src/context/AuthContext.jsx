// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useRef,useContext } from "react";
import API from "../services/api";
import socket from "../services/socket";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const bootstrapped = useRef(false);

  /* =====================================================
     LOAD AUTH USER (SAFE, ISOLATED, ONCE)
  ===================================================== */
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/users/me")
      .then((res) => {
        if (!res.data?._id) return;

        // ✅ CLONE USER OBJECT (NO SHARED REFERENCE)
        const safeUser = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          profile: res.data.profile || {},
          points: res.data.points || 0,
          messageCount: res.data.messageCount || 0,
          aiQuestionsAsked: res.data.aiQuestionsAsked || 0,
          streakDays: res.data.streakDays || 0,
          achievements: res.data.achievements || [],
        };

        setUser(safeUser);

        // ✅ bind socket identity ONCE
        socket.emit("register-user", safeUser._id);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  /* =====================================================
     LOGIN (NO MUTATION, NO REUSE)
  ===================================================== */
  const login = (userData, token) => {
    if (!userData?._id || !token) {
      throw new Error("Invalid login payload");
    }

    localStorage.setItem("token", token);

    // ✅ CREATE FRESH USER SNAPSHOT
    const safeUser = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      profile: userData.profile || {},
      points: userData.points || 0,
      messageCount: userData.messageCount || 0,
      aiQuestionsAsked: userData.aiQuestionsAsked || 0,
      streakDays: userData.streakDays || 0,
      achievements: userData.achievements || [],
    };

    setUser(safeUser);

    socket.emit("register-user", safeUser._id);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
