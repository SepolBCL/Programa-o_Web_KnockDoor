import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


function Header() {
  const { userInfo, communityInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();               
    navigate('/');     // redireciona para a página MyHome
  };

  return (
    <div>
      {userInfo && communityInfo ? (
        <div>
          <span>{userInfo.nome}</span>
          <span>{communityInfo.nome}</span>
        </div>
      ) : (
        <span>Carregando...</span>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Header;
