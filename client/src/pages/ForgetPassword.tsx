import React, { useEffect, useState } from "react";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>
        <div style={styles.back}>
          <a href="/login" style={styles.link}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

// Inline styles matching your original CSS
const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #0f0f0f, #1a1a1a)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    color: "#fff",
  },
  card: {
    backdropFilter: "blur(15px)",
    background: "rgba(28, 28, 28, 0.85)",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 0 20px rgba(93, 95, 239, 0.3)",
    animation: "fadeIn 0.8s ease",
  },
  title: {
    fontSize: "28px",
    textAlign: "center",
    marginBottom: "25px",
    color: "#ffffff",
    textShadow: "0 0 8px rgba(93, 95, 239, 0.6)",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "20px",
    fontSize: "16px",
    background: "#2d2d2d",
    color: "#fff",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(145deg, #5d5fef, #7376fa)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(93, 95, 239, 0.4)",
    transition: "transform 0.2s ease",
  },
  back: {
    marginTop: "20px",
    textAlign: "center",
  },
  link: {
    color: "#aab6ff",
    textDecoration: "none",
    fontSize: "14px",
  },
};

export default ForgetPassword;
