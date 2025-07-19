import React, { useState, useContext } from 'react';
import Header from '../components/Header';
import '../styles/App.css';
import { AuthContext } from '../contexts/AuthContext';
import PopupDetails from '../components/PopupDetails';
import { useNavigate } from 'react-router-dom';
import BotaoAcao from '../components/BotaoAcao';

const AddGroupSharing = () => {
    const { authToken, userInfo } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const navigate = useNavigate();

    const [groupData, setGroupData] = useState({
        nome: '',
        descricao: '',
        estadoId: 1,
        regraGrupoId: 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!authToken || !userInfo) {
            setErrorMessage('Token ou dados do utilizador ausentes.');
            return;
        }

        const payload = {
            nome: groupData.nome,
            descricao: groupData.descricao,
            dataCriacao: new Date().toISOString().split('T')[0],
            estadoId: parseInt(groupData.estadoId),
            regraGrupoId: parseInt(groupData.regraGrupoId),
            responsavelId: userInfo.utilizadorId,
        };

        try {
            const response = await fetch('http://localhost:5053/api/grupopartilha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const novoGrupo = await response.json();

                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("imagem", selectedImage);

                    fetch(`http://localhost:5053/api/grupopartilha/upload-imagem/${novoGrupo.grupoId}`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${authToken}`
                        },
                        body: formData
                    })
                        .then(() => console.log("Imagem do grupo enviada com sucesso."))
                        .catch(err => console.error("Erro ao enviar imagem:", err));
                }

                setShowModal(true);
                console.log('Grupo partilha criado com sucesso!');
            }
            else {
                const err = await response.text();
                console.error('Erro da API:', err);
                setErrorMessage('Erro ao criar grupo. Verifica os campos.');
            }
        } catch (error) {
            console.error('Erro ao criar grupo:', error);
            setErrorMessage('Erro de rede.');
        }
    };

    const handleCancel = () => {
        window.history.back();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setErrorMessage('');
        navigate('/MyGroupSharing');
    };

    return (
        <>
            <div className="add-groupsharing-container">
                <Header />
                <div className="add-groupsharing-wrapper">

                    <h1 className="title">Criar Grupo de Partilha</h1>

                    <form className="groupsharing-form" onSubmit={handleSubmit}>
                        <div className="form-columns">
                            <div className="form-column">
                                <div className="form-group">
                                    <label>Nome do Grupo</label>
                                    <input type="text" name="nome" value={groupData.nome} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Descrição</label>
                                    <textarea name="descricao" value={groupData.descricao} onChange={handleChange} required></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Estado</label>
                                    <select name="estadoId" value={groupData.estadoId} onChange={handleChange} required>
                                        <option value="1">Ativo</option>
                                        <option value="2">Inativo</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Regra do Grupo</label>
                                    <select name="regraGrupoId" value={groupData.regraGrupoId} onChange={handleChange} required>
                                        <option value="1">Regra Padrão</option>
                                        <option value="2">Regra Especial</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Imagem do Grupo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSelectedImage(e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <BotaoAcao
                                texto="Confirmar"
                                type="submit"
                                classe="btn02 confirm-btn02"
                            />
                            <BotaoAcao
                                texto="Cancelar"
                                type="button"
                                onClick={handleCancel}
                                classe="btn02 cancel-btn02"
                            />
                        </div>
                    </form>

                    {showModal && (
                        <PopupDetails titulo="Grupo criado com sucesso!" onClose={handleCloseModal}>
                            <p>O grupo foi registado e está disponível para partilha.</p>
                        </PopupDetails>
                    )}


                    {errorMessage && (
                        <div className="error-message">
                            <p>{errorMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AddGroupSharing;
