import React from "react";
import { useNavigate, useLocation } from "react-router-dom";


const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const showBackButton = location.pathname !== "/"; // Hide back button on root login

  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <button className="back-btn" onClick={() => navigate(-1)}> Back</button>
        )}
        <h4>AI Call Center</h4>
      </div>

      <div className="header-right">
        <span>{user?.name} ({user?.role})</span>
        <button className="logout-btn" onClick={onLogout}> Logout</button>
      </div>
    </header>
  );
};

export default Header;
