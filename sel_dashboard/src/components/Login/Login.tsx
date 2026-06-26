import { useState } from "react";
import { login } from "../../api/authApi";
import "./Login.css";

type Props = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");

      const result = await login(username, password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.user.role);
      localStorage.setItem("username", result.user.username);

      onLoginSuccess();
    } catch {
      setError("Invalid username or password.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>IOT Device Management</h1>
        <p>Secure access to grid device dashboard</p>

        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button onClick={handleLogin}>Login</button>

        {/* <small>Demo: admin/admin123, operator/operator123, viewer/viewer123</small> */}
      </section>
    </main>
  );
}

export default Login;