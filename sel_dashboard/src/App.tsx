import { useEffect, useState } from "react";
import DeviceDashboard from "./components/Device/DeviceDashboard/DeviceDashboard";
import Login from "./components/Login/Login";
import { setUnauthorizedHandler } from "./api/apiClient";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
  }

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
  }, []);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="page">
      <DeviceDashboard onLogout={handleLogout} />
    </div>
  );
}

export default App;
