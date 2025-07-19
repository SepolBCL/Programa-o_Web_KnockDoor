import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import BotaoAcao from '../components/BotaoAcao';


const RegisterModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        dataNascimento: '',
        endereco: '',
        codigoPostal: '',
    });

    const [postalInfo, setPostalInfo] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (formData.codigoPostal.length >= 4) {
            fetch(`http://localhost:5053/api/CodigoPostal/search/${formData.codigoPostal}`)
                .then((res) => res.json())
                .then((data) => {
                    setPostalInfo(data.$values || []);
                })
                .catch((err) => {
                    console.error('Erro ao buscar códigos postais:', err);
                    setPostalInfo([]);
                });
        } else {
            setPostalInfo([]);
        }
    }, [formData.codigoPostal]);

    const handleSelectPostal = (e) => {
        const selected = postalInfo.find((item) => item.codigoPostal1 === e.target.value);
        if (selected) {
            setFormData({ ...formData, codigoPostal: selected.codigoPostal1 });
            setPostalInfo([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5053/api/utilizador', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccessMessage('✅ Utilizador criado com sucesso!');
                setFormData({
                    nome: '',
                    email: '',
                    telefone: '',
                    senha: '',
                    dataNascimento: '',
                    endereco: '',
                    codigoPostal: '',
                });
                setPostalInfo([]);
            } else {
                const err = await res.text();
                console.error('Erro da API:', err);
                alert('Erro ao criar utilizador.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de rede.');
        }
    };

    return (
        <div className="modal-overlay2">
            <div className="modal-content2">
                <h2>Registar Utilizador</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group2">
                        <label htmlFor="nome">Nome</label>
                        <input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
                    </div>

                    <div className="form-group2">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group2">
                        <label htmlFor="telefone">Telefone</label>
                        <input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} required />
                    </div>

                    <div className="form-group2">
                        <label htmlFor="senha">Senha</label>
                        <input id="senha" name="senha" type="password" value={formData.senha} onChange={handleChange} required />
                    </div>

                    <div className="form-group2">
                        <label htmlFor="dataNascimento">Data de Nascimento</label>
                        <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required />
                    </div>

                    <div className="form-group2">
                        <label htmlFor="endereco">Endereço</label>
                        <input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} required />
                    </div>

                    <div className="form-group2">
                        <label htmlFor="codigoPostal">Código Postal</label>
                        <input id="codigoPostal" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} required />
                    </div>

                    <div className="modal-buttons">
                        <BotaoAcao
                            texto="Submeter"
                            type="submit"
                            classe="btn-submit"
                        />
                        <BotaoAcao
                            texto="Cancelar"
                            type="button"
                            onClick={onClose}
                            classe="btn-cancel"
                        />
                    </div>
                </form>

                {postalInfo.length > 0 && (
                    <div className="select-container">
                        <label htmlFor="selectPostal">Selecionar Código Postal:</label>
                        <select id="selectPostal" onChange={handleSelectPostal} defaultValue="">
                            <option value="" disabled>Escolha uma opção</option>
                            {postalInfo.map((item) => (
                                <option key={item.codigoPostal1} value={item.codigoPostal1}>
                                    {item.codigoPostal1} - {item.descricao}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterModal;
