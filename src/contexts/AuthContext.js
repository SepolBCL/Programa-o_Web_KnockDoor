// contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [communityInfo, setCommunityInfo] = useState(null);

  // Carregar do localStorage ao montar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedCommunity = localStorage.getItem('community');

    if (storedToken) setAuthToken(storedToken);
    if (storedUser) setUserInfo(JSON.parse(storedUser));
    if (storedCommunity) setCommunityInfo(JSON.parse(storedCommunity));
  }, []);

  const login = (user, token, community) => {
    setAuthToken(token);
    setUserInfo(user);
    setCommunityInfo(community);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('community', JSON.stringify(community));
  };

  const logout = () => {
    setAuthToken(null);
    setUserInfo(null);
    setCommunityInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('community');
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userInfo,
        communityInfo,
        login,
        logout,
        setCommunityInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
