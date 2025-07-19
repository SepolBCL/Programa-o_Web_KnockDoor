import React, { useState, useContext, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/AddService.css';
import { AuthContext } from '../contexts/AuthContext';
import BotaoAcao from '../components/BotaoAcao';
import { useNavigate } from 'react-router-dom';
import PopupDetails from '../components/PopupDetails';

const AddService = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const { authToken, userInfo, communityInfo } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [tiposServico, setTiposServico] = useState([]);
    const navigate = useNavigate();


    const [serviceData, setServiceData] = useState({
        nome: '',
        descricao: '',
        preco: 0,
        disponibilidade: true,
        tipoServicoId: 0,
    });

    useEffect(() => {
        if (!authToken) return;

        const fetchTiposServico = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/tiposervico', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await response.json();
                setTiposServico(data.$values || []);
            } catch (error) {
                console.error('Erro ao obter tipos de serviço:', error);
            }
        };

        fetchTiposServico();
    }, [authToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setServiceData((prev) => ({
            ...prev,
            [name]: name === 'disponibilidade' ? value === 'true' : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!authToken || !userInfo || !communityInfo) {
            setErrorMessage('Token ou dados do utilizador/comunidade ausentes.');
            return;
        }

        const payload = {
            nome: serviceData.nome,
            descricao: serviceData.descricao,
            dataCriacao: new Date().toISOString().split('T')[0],
            preco: parseFloat(serviceData.preco),
            disponibilidade: serviceData.disponibilidade === true || serviceData.disponibilidade === 'true',
            comunidadeId: communityInfo.comunidadeId,
            prestadorId: userInfo.utilizadorId,
            tipoServicoId: parseInt(serviceData.tipoServicoId),
        };

        try {
            const response = await fetch('http://localhost:5053/api/servico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const novoServico = await response.json();

                // Se houver imagem, fazer upload
                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("imagem", selectedImage);

                    fetch(`http://localhost:5053/api/servico/upload-imagem/${novoServico.servicoId}`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${authToken}`
                        },
                        body: formData
                    })
                        .then(() => console.log("Imagem enviada com sucesso!"))
                        .catch(err => console.error("Erro ao enviar imagem:", err));
                }

                setShowModal(true);
                console.log('Serviço criado com sucesso!');
                navigate('/MyServices');
            }
            else {
                const err = await response.text();
                console.error('Erro da API:', err);
                setErrorMessage('Erro ao criar serviço. Verifique os campos.');
            }
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            setErrorMessage('Erro de rede.');
        }
    };

    const handleCancel = () => {
        window.history.back();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setErrorMessage('');
        navigate('/MyServices');
    };


    return (
        <div className="add-service-container">
            <Header />
            <div className="add-service-wrapper">
                <h1 className="title">Criar Serviço</h1>

                <form className="service-form" onSubmit={handleSubmit}>
                    <div className="form-columns">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Nome</label>
                                <input type="text" name="nome" value={serviceData.nome} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea name="descricao" value={serviceData.descricao} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Preço</label>
                                <input type="number" name="preco" step="0.01" value={serviceData.preco} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Disponibilidade</label>
                                <select name="disponibilidade" value={serviceData.disponibilidade.toString()} onChange={handleChange} required>
                                    <option value="true">Disponível</option>
                                    <option value="false">Indisponível</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tipo de Serviço</label>
                                <select name="tipoServicoId" value={serviceData.tipoServicoId} onChange={handleChange} required>
                                    <option value="0">Selecione o tipo de serviço</option>
                                    {tiposServico.map((tipo) => (
                                        <option key={tipo.tipoServicoId} value={tipo.tipoServicoId}>
                                            {tipo.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Imagem do Serviço</label>
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
                            classe="btn confirm-btn"
                        />
                        <BotaoAcao
                            texto="Cancelar"
                            type="button"
                            onClick={handleCancel}
                            classe="btn cancel-btn"
                        />
                    </div>
                </form>

                {showModal && (
                    <PopupDetails titulo="Serviço criado com sucesso!" onClose={handleCloseModal}>
                        <p>O seu serviço agora está disponível.</p>
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

export default AddService;
