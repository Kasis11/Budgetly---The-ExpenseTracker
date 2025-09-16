import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // loader state
  const navigate = useNavigate();

  // ✅ Auto-login if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/"); // skip login if token exists
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("token/", { username, password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      navigate("/");
    } catch (error) {
      alert("Invalid credentials. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Logging in...</p>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
