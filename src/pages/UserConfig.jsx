import React, { useState, useContext, useEffect } from 'react';
import Header from '../components/Header';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/UserConfig.css';
import BotaoAcao from '../components/BotaoAcao';

export default function UserConf() {
    const { userInfo, authToken, login } = useContext(AuthContext);

    const [editUserData, setEditUserData] = useState({
        nome: userInfo?.nome || '',
        email: userInfo?.email || '',
        telefone: userInfo?.telefone || '',
        dataNascimento: userInfo?.dataNascimento?.split('T')[0] || '',
        endereco: userInfo?.endereco || '',
        codigoPostal: userInfo?.codigoPostal || '',
    });

    const [postalInfo, setPostalInfo] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (editUserData.codigoPostal.length >= 4) {
            fetch(`http://localhost:5053/api/CodigoPostal/search/${editUserData.codigoPostal}`)
                .then(res => res.json())
                .then(data => setPostalInfo(data.$values || []))
                .catch(() => setPostalInfo([]));
        } else {
            setPostalInfo([]);
        }
    }, [editUserData.codigoPostal]);

    const handleSelectPostal = (e) => {
        const selected = postalInfo.find((item) => item.codigoPostal1 === e.target.value);
        if (selected) {
            setEditUserData((prev) => ({
                ...prev,
                codigoPostal: selected.codigoPostal1,
            }));
            setPostalInfo([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateUserSubmit = async (e) => {
        e.preventDefault();

        // Faz scroll automático para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const payload = {
                nome: editUserData.nome,
                email: editUserData.email,
                telefone: editUserData.telefone,
                dataNascimento: editUserData.dataNascimento,
                endereco: editUserData.endereco,
                codigoPostal: editUserData.codigoPostal,
            };

            const response = await fetch(`http://localhost:5053/api/utilizador/${userInfo.utilizadorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSuccessMessage('✅ Utilizador atualizado com sucesso!');
                // Atualiza também o AuthContext para refletir novos dados globalmente
                login({ ...userInfo, ...payload }, authToken, JSON.parse(localStorage.getItem('community')));
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorText = await response.text();
                setErrorMessage(`❌ Erro: ${errorText}`);
                setTimeout(() => setErrorMessage(''), 3000);
            }
        } catch (error) {
            console.error('Erro:', error);
            setErrorMessage('❌ Erro ao atualizar utilizador.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    return (
        <> <main className="user-conf-container">
            <Header />

            <h1 className="user-conf-title">Configuração da Conta</h1>

            {successMessage && <div className="success-alert">{successMessage}</div>}
            {errorMessage && <div className="error-alert">{errorMessage}</div>}

            <form onSubmit={handleUpdateUserSubmit} className="edit-user-form">
                <label>
                    Nome:
                    <input type="text" name="nome" value={editUserData.nome} onChange={handleInputChange} required />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={editUserData.email} onChange={handleInputChange} required />
                </label>
                <label>
                    Telefone:
                    <input type="text" name="telefone" value={editUserData.telefone} onChange={handleInputChange} required />
                </label>
                <label>
                    Data de Nascimento:
                    <input type="date" name="dataNascimento" value={editUserData.dataNascimento} onChange={handleInputChange} required />
                </label>
                <label>
                    Endereço:
                    <input type="text" name="endereco" value={editUserData.endereco} onChange={handleInputChange} required />
                </label>
                <label backgroundColor="#transparent">
                    Código Postal:
                    <input backgroundColor="#transparent" type="text" name="codigoPostal" value={editUserData.codigoPostal} onChange={handleInputChange} required />
                </label>

                {postalInfo.length > 0 && (
                    <div className="select-container" backgroundColor="#transparent">
                        <label>Selecionar Código Postal:</label>
                        <select onChange={handleSelectPostal} defaultValue="">
                            <option value="" disabled>Escolha uma opção</option>
                            {postalInfo.map((item) => (
                                <option key={item.codigoPostal1} value={item.codigoPostal1}>
                                    {item.codigoPostal1} - {item.descricao}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="modal-actions">
                    <BotaoAcao
                        texto="Atualizar Dados"
                        type="submit"
                        classe="modal-btn"
                    />
                </div>
            </form>
        </main>
        </>
    );
}
