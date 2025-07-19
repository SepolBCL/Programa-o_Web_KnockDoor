import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import BotaoAcao from '../components/BotaoAcao';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [senha, setSenha] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5053/api/Utilizador/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, senha })
            });

            if (response.ok) {
                const msg = await response.text();
                setMessage(msg + ' A redirecionar para o login...');
                setTimeout(() => navigate('/'), 3000);
            } else if (response.status === 400) {
                const err = await response.text();
                setError(err || 'Token inválido ou expirado.');
            } else if (response.status === 404) {
                setError('Utilizador não encontrado.');
            } else {
                setError('Erro inesperado. Tente novamente.');
            }
        } catch {
            setError('Erro ao contactar o servidor.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-panel">
                <img src="/KD_Logo.png" alt="KnockDoor Logo" className="logo" />

                <p style={{ fontSize: '20px', color: '#2d3e50', marginBottom: '20px' }}>Comunidade Entre Vizinhos</p>

                <h2 className="subtitle">Definir Password</h2>

                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Nova senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />

                    <div className="login-buttons">
                        <BotaoAcao
                            texto="Alterar Password"
                            type="submit"
                            classe="login-form-btn"
                        />
                    </div>
                </form>

                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
}
