import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Login from './pages/Login';
import Home from './pages/Home';
import MyHome from './pages/MyHome';
import UserConfig from './pages/UserConfig';
import AddResource from './pages/AddResource';
import AddGroupSharing from './pages/AddGroupSharing';
import AddService from './pages/AddService';
import MyResource from './pages/MyResource';
import Resource from './pages/Resource';
import MyServices from './pages/MyServices';
import Services from './pages/Services';
import MyGroupSharing from './pages/MyGroupSharing';
import GroupSharing from './pages/GroupSharing';
import RecoverPassword from './pages/RecoverPassword';
import ResetPassword from './pages/ResetPassword';
import RentResource from './pages/RentResource';
import MyRentals from './pages/MyRentals';
import RentGroupSharing from './pages/RentGroupSharing';
import PendingActions from './pages/PendingActions';
import AprovalMember from './pages/AprovalMember';
import RequestService from './pages/RequestService';
import RequestedServices from './pages/RequestedServices';
import PendingActionsServices from './pages/PendingActionsServices';
import './styles/App.css'; // Importação do CSS global

function App() {
  return (
    <AuthProvider> {/* Envolva o App com o AuthProvider */}
      <Router>
        <Routes>
          {/* Página inicial pública */}
          <Route path="/" element={<MyHome />} />

          {/* Login só se não estiver autenticado */}
          <Route path="/login" element={<Login />} />

          {/* Home protegida */}
          <Route path="/home" element={<Home />} />

          {/* Rotas protegidas */}
          <Route path="/user-config" element={<UserConfig />} />
          <Route path="/add-resource" element={<AddResource />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/add-groupsharing" element={<AddGroupSharing />} />
          <Route path="/MyResource" element={<MyResource />} />
          <Route path="/Resource" element={<Resource />} />
          <Route path="/MyServices" element={<MyServices />} />
          <Route path="/Services" element={<Services />} />
          <Route path="/MyGroupSharing" element={<MyGroupSharing />} />
          <Route path="/GroupSharing" element={<GroupSharing />} />
          <Route path="/RecoverPassword" element={<RecoverPassword />} />
          <Route path="/ResetPassword/:token" element={<ResetPassword />} />
          <Route path="/RentResource/:id" element={<RentResource />} />
          <Route path="/MyRentals" element={<MyRentals />} />
          <Route path="/PendingActions" element={<PendingActions />} />
		      <Route path="/RentGroupSharing/:grupoId" element={<RentGroupSharing />} />
          <Route path="/AprovalMember" element={<AprovalMember />} />
          <Route path="/RequestService/:id" element={<RequestService />} />
          <Route path="/RequestedServices" element={<RequestedServices />} />
          <Route path="/PendingActionsServices" element={<PendingActionsServices />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
