import React, { useState, useContext } from "react";
import "./Auth.css";
import PrimaryButton from "../../components/common/PrimaryButton";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Register user
      await API.post("/auth/register", form);

      // Auto-login user
      const res = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // Save user + token in context
      login(res.data.user, res.data.token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your EduSync account ✨</h1>
        <p className="auth-subtitle">
          Join as a student, teacher, or community host.
        </p>

        {error && <p className="error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Community admin</option>
            </select>
          </label>

          <PrimaryButton type="submit">Sign up</PrimaryButton>
        </form>

        <p className="auth-footer-text">
          Already have an account? <a href="/login">Log in</a>.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
