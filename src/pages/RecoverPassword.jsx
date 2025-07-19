import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o hook de navegação
import '../styles/Login.css';
import BotaoAcao from '../components/BotaoAcao';

export default function RecoverPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate(); // inicializa o hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5053/api/Utilizador/recuperar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const msg = await response.text();
                setMessage(msg);
            } else {
                const err = await response.text();
                setError(err);
            }
        } catch {
            setError('Erro ao contactar o servidor.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-panel">
                <img src="/KD_Logo.png" className="logo2" alt="KnockDoor Logo" />
                <div className="CMV">Comunidade Entre Vizinhos</div>

                <h2 className="subtitle">Recuperar Password</h2>

                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="login-buttons">
                        <BotaoAcao
                            texto="Enviar Instruções"
                            type="submit"
                            classe="login-form-btn"
                        />
                        <BotaoAcao
                            texto="Cancelar"
                            type="button"
                            onClick={() => navigate(-1)}
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
