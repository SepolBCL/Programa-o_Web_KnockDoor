import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import '../styles/AddResource.css';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PopupDetails from '../components/PopupDetails';
import BotaoAcao from '../components/BotaoAcao';

const AddResource = () => {
    const { authToken, userInfo, communityInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [tiposRecurso, setTiposRecurso] = useState([]);


    const [resourceData, setResourceData] = useState({
        nome: '',
        descricao: '',
        tempoMinimoReserva: 0,
        tempoMaximoReserva: 0,
        preco: 0,
        disponibilidade: true,
        tipoRecursoId: 0,
        comunidadeId: communityInfo?.comunidadeId || 0,
        utilizadorId: userInfo?.utilizadorId || 0,
    });


    useEffect(() => {
        if (userInfo && communityInfo) {
            setResourceData(prev => ({
                ...prev,
                utilizadorId: userInfo.utilizadorId,
                comunidadeId: communityInfo.comunidadeId
            }));
        }

        const obterTiposRecurso = async () => {
            try {
                const tipoRes = await fetch('http://localhost:5053/api/tiporecurso', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const tipoData = await tipoRes.json();
                setTiposRecurso(tipoData.$values);
            } catch (error) {
                console.error('Erro ao obter tipos de recurso:', error);
            }
        };

        if (authToken) obterTiposRecurso();
    }, [authToken, userInfo, communityInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setResourceData((prevData) => ({
            ...prevData,
            [name]: name === 'disponibilidade' ? value === 'true' : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (
            !resourceData.nome ||
            !resourceData.descricao ||
            resourceData.preco <= 0 ||
            resourceData.tempoMinimoReserva <= 0 ||
            resourceData.tempoMaximoReserva <= 0
        ) {
            setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const dataToSend = {
            nome: resourceData.nome,
            descricao: resourceData.descricao,
            tempoMinimoReserva: parseInt(resourceData.tempoMinimoReserva),
            tempoMaximoReserva: parseInt(resourceData.tempoMaximoReserva),
            preco: parseFloat(resourceData.preco),
            dataCriacao: new Date().toISOString().split('T')[0],
            disponibilidade: resourceData.disponibilidade,
            tipoRecursoId: parseInt(resourceData.tipoRecursoId),
            comunidadeId: parseInt(resourceData.comunidadeId),
            utilizadorId: parseInt(resourceData.utilizadorId),
        };

        fetch('http://localhost:5053/api/recurso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(dataToSend),
        })
            .then((response) => {
                if (response.ok) return response.json();
                else return Promise.reject('Falha ao adicionar o recurso');
            })
            .then((data) => {
                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("imagem", selectedImage);

                    fetch(`http://localhost:5053/api/recurso/upload-imagem/${data.recursoId}`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: formData,
                    })
                        .then(() => console.log("Imagem do recurso enviada com sucesso."))
                        .catch(err => console.error("Erro ao enviar imagem:", err));
                }

                setShowModal(true);
            })
            .catch((error) => {
                setErrorMessage(error);
                console.error('Erro ao adicionar recurso:', error);
            });
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <div className="add-resource-container">
            <Header />
            <div className="add-resource-wrapper">
                <h1 className="title">Adicionar Recurso</h1>

                <form className="resource-form" onSubmit={handleSubmit}>
                    <div className="form-columns">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Título</label>
                                <p>Nome do recurso</p>
                                <input type="text" name="nome" value={resourceData.nome} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Tipo</label>
                                <p>Selecione o tipo do recurso</p>
                                <select name="tipoRecursoId" value={resourceData.tipoRecursoId} onChange={handleChange} required>
                                    <option value="0">Selecione o tipo</option>
                                    {tiposRecurso.map((tipo) => (
                                        <option key={tipo.tipoRecursoId} value={tipo.tipoRecursoId}>
                                            {tipo.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Preço</label>
                                <p>Preço por hora</p>
                                <input
                                    type="number"
                                    name="preco"
                                    value={resourceData.preco}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Tempo Mínimo Reserva (horas)</label>
                                <p>Tempo mínimo permitido por reserva</p>
                                <input
                                    type="number"
                                    name="tempoMinimoReserva"
                                    value={resourceData.tempoMinimoReserva}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Tempo Máximo Reserva (horas)</label>
                                <p>Tempo máximo permitido por reserva</p>
                                <input
                                    type="number"
                                    name="tempoMaximoReserva"
                                    value={resourceData.tempoMaximoReserva}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <p>Detalhes adicionais sobre o recurso</p>
                                <textarea name="descricao" value={resourceData.descricao} onChange={handleChange} required></textarea>
                            </div>

                            <div className="form-group">
                                <label>Disponibilidade</label>
                                <p>Indique se o recurso está disponível</p>
                                <select
                                    name="disponibilidade"
                                    value={resourceData.disponibilidade ? 'true' : 'false'}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="true">Disponível</option>
                                    <option value="false">Indisponível</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Comunidade</label>
                                <p>A tua comunidade</p>
                                <select name="comunidadeId" value={resourceData.comunidadeId} onChange={handleChange} required>
                                    <option value={communityInfo?.comunidadeId}>{communityInfo?.nome}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Utilizador</label>
                                <p>Criador do recurso</p>
                                <select name="utilizadorId" value={resourceData.utilizadorId} onChange={handleChange} required>
                                    <option value={userInfo?.utilizadorId}>{userInfo?.nome}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Imagem do Recurso</label>
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
                            classe="btn3 confirm-btn3"
                        />
                        <BotaoAcao
                            texto="Cancelar"
                            type="button"
                            onClick={handleCancel}
                            classe="btn3 cancel-btn3"
                        />
                    </div>
                </form>

                {showModal && (
                    <PopupDetails titulo="Recurso adicionado com sucesso!" onClose={() => navigate('/MyResource')}>
                        <p>O recurso foi registado com sucesso.</p>
                    </PopupDetails>
                )}


                {errorMessage && (
                    <div className="error-message">
                        <p>{errorMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddResource;
