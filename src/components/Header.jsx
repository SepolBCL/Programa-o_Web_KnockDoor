import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const { authToken, userInfo, communityInfo, logout, setCommunityInfo } = useContext(AuthContext);

  const headerRef = useRef(null);
/* Apartir da aqui*/
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (authToken && userInfo) {
      fetch(`http://localhost:5053/api/comunidadeutilizador/ativas/utilizador/${userInfo.utilizadorId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Comunidades ativas (raw):', data);
          setCommunities(data.$values || []);
        })
        .catch((error) => console.error('Erro ao obter comunidades ativas:', error));
    }
  }, [authToken, userInfo]);

  const handleClickOutside = (event) => {
    if (headerRef.current && !headerRef.current.contains(event.target)) {
      setActiveDropdown(null);
      setShowCommunityDropdown(false);
    }
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
    setShowCommunityDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChangeCommunity = (communityDto) => {
    setShowCommunityDropdown(false);
    const community = {
      comunidadeId: communityDto.comunidadeId,
      nome: communityDto.nomeComunidade,
    };
    setCommunityInfo(community);
    localStorage.setItem('community', JSON.stringify(community));
    navigate('/home');
  };

  const isUserConfigActive = location.pathname === '/user-config';

  return (
    <header className="header" ref={headerRef}>
      <div className="logo" onClick={() => navigate('/home')}>
        <img src="/KD_Logo.png" alt="KnockDoor Logo" className="logo-img" />
        <div className="logo-text">Comunidade Entre Vizinhos </div>
      </div>

      <nav className="nav">
        <div className={`nav-item ${activeDropdown === 'resources' ? 'active' : ''}`} onClick={() => toggleDropdown('resources')}>
          Gestão de Recursos
          {activeDropdown === 'resources' && (
            <ul className="dropdown">
              <li onClick={() => navigate('/MyResource')}>Meus Anúncios</li>
              <li onClick={() => navigate('/Resource')}>Alugar Recursos</li>
            </ul>
          )}
        </div>

        <div className={`nav-item ${activeDropdown === 'sharing' ? 'active' : ''}`} style={{color: ' #365b99'}} onClick={() => toggleDropdown('sharing')}>
          Grupos de Partilha
          {activeDropdown === 'sharing' && (
            <ul className="dropdown">
              <li onClick={() => navigate('/MyGroupSharing')}>Meus Grupos de Partilha</li>
              <li onClick={() => navigate('/GroupSharing')}>Grupos de Partilha</li>
            </ul>
          )}
        </div>

        <div className={`nav-item ${activeDropdown === 'services' ? 'active' : ''}`} style={{color: ' #0074d9'}}onClick={() => toggleDropdown('services')}> 
          Prestação de Serviço
          {activeDropdown === 'services' && (
            <ul className="dropdown">
              <li onClick={() => navigate('/MyServices')}>Meus Serviços</li>
              <li onClick={() => navigate('/Services')}>Prestação de Serviços</li>
            </ul>
          )}
        </div>
      </nav>

      <div className="header-actions">
        {userInfo && communityInfo ? (
          <div className="user-info">
            <span className="user-name">{userInfo.nome}</span>
            <div
              className="user-community-wrapper"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommunityDropdown((prev) => !prev);
              }}
            >
              <span className="user-community-selector">
                {communityInfo.nome} <FaChevronDown style={{ marginLeft: '5px' }} />
              </span>
              {showCommunityDropdown && (
                <div className="community-dropdown-menu">
                  {communities.length > 0 ? (
                    communities.map((com) => (
                      <div
                        key={com.comunidadeId}
                        className="community-dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeCommunity(com);
                        }}
                      >
                        {com.nomeComunidade}
                      </div>
                    ))
                  ) : (
                    <div className="community-dropdown-item">Nenhuma comunidade</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <span>A carregar...</span>
        )}
      </div>
        <div className ="header-actions2 button">
        <button className={isUserConfigActive ? 'active' : ''} onClick={() => navigate('/user-config')}> Gestão Utilizador</button>
        <button onClick={handleLogout}>Terminar Sessão</button>
      
      </div>      
    </header>
  );
}
