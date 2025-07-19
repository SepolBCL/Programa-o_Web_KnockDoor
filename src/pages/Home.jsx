import React, { useEffect, useState, useContext } from 'react';
import Header from '../components/Header';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import BotaoAcao from '../components/BotaoAcao';
import InfoCardUnified from '../components/InfoCardUnified';

export default function Home() {
    const { authToken } = useContext(AuthContext);
    const [recursos, setRecursos] = useState([]);
    const [tiposRecurso, setTiposRecurso] = useState([]);
    const [tiposServico, setTiposServico] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authToken) {
            navigate('/');
            return;
        }

        const fetchTiposServico = async () => {
            try {
                const res = await fetch('http://localhost:5053/api/tiposervico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = await res.json();
                setTiposServico(data.$values || []);
            } catch (error) {
                console.error('Erro ao obter tipos de serviço:', error);
            }
        };

        fetchTiposServico();

        const fetchTiposRecurso = async () => {
            try {
                const res = await fetch('http://localhost:5053/api/tiporecurso', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = await res.json();
                setTiposRecurso(data.$values || []);
            } catch (error) {
                console.error('Erro ao obter tipos de recurso:', error);
            }
        };

        fetchTiposRecurso();
    }, [authToken, navigate]);

    useEffect(() => {
        if (!authToken || tiposRecurso.length === 0 || tiposServico.length === 0) return;


        const fetchResources = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/recurso', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error('Erro ao obter recursos');
                const data = await response.json();
                const ativos = data.$values
                    .filter((item) => item.disponibilidade === true)
                    .map((item) => ({
                        ...item,
                        tipoRecurso: tiposRecurso.find(t => t.tipoRecursoId === item.tipoRecursoId) || {}
                    }));

                setRecursos(ativos);
            } catch (error) {
                console.error('Erro ao obter recursos:', error);
            }
        };

        const fetchGroups = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/grupopartilha', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error('Erro ao obter grupos');
                const data = await response.json();
                const ativos = data.$values.filter((item) => item.estadoId === 2);
                setGrupos(ativos);
            } catch (error) {
                console.error('Erro ao obter grupos:', error);
            }
        };

        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/servico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error('Erro ao obter serviços');
                const data = await response.json();
                const ativos = data.$values
                    .filter((item) => item.disponibilidade === true)
                    .map((item) => ({
                        ...item,
                        tipoServico: tiposServico.find(t => t.tipoServicoId === item.tipoServicoId) || {}
                    }));
                setServicos(ativos);
            } catch (error) {
                console.error('Erro ao obter serviços:', error);
            }
        };


        fetchResources();
        fetchGroups();
        fetchServices();
    }, [authToken, tiposRecurso, tiposServico, navigate]);

    const handleMoreInfoClick = (data) => {
        setPopupData(data);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupData(null);
    };

    const renderPopupContent = () => {
    if (!popupData) return null;

        const isRecurso = popupData.tipoRecurso !== undefined;
        const isGrupo = popupData.estadoId !== undefined;
        const isServico = !isRecurso && !isGrupo;

        const imageSrc = isRecurso
            ? `http://localhost:5053/images/recursos/recurso${popupData.recursoId}.jpg`
            : isServico
                ? `http://localhost:5053/images/servicos/servico${popupData.servicoId}.jpg`
                : isGrupo
                    ? `http://localhost:5053/images/grupos/grupo${popupData.grupoId}.jpg`
                    : '';

        return (
            <>
                <h3>{popupData.nome}</h3>

                {imageSrc && (
                    <div className="image-popup-wrapper">
                        <img
                            src={imageSrc}
                            alt={`Imagem de ${popupData.nome}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'http://localhost:5053/images/sem-foto.jpg';
                            }}
                            className="imagehome"
                        />
                    </div>
                )}

                {isRecurso && (
                    <>
                        <p><strong>Tipo:</strong> {popupData.tipoRecurso?.nome || 'Não definido'}</p>
                        <p><strong>Valor:</strong> {popupData.preco}€</p>
                        <p><strong>Descrição:</strong> {popupData.descricao || 'Sem descrição'}</p>
                        <p><strong>Disponibilidade:</strong> {popupData.disponibilidade ? 'Disponível' : 'Indisponível'}</p>
                    </>
                )}

                {isGrupo && (
                    <>
                        <p><strong>Estado:</strong> {popupData.estadoId === 2 ? 'Ativo' : 'Inativo'}</p>
                        <p><strong>Descrição:</strong> {popupData.descricao || 'Sem descrição'}</p>
                    </>
                )}

                {isServico && (
                    <>
                        <p><strong>Tipo:</strong> {popupData.tipoServico?.nome || 'Serviço'}</p>
                        <p><strong>Valor:</strong> {popupData.preco}€</p>
                        <p><strong>Descrição:</strong> {popupData.descricao || 'Sem descrição'}</p>
                        <p><strong>Disponibilidade:</strong> {popupData.disponibilidade ? 'Disponível' : 'Indisponível'}</p>
                    </>
                )}
            </>
        );
    };

    return (
        <div className="home-container3">
            <Header />

            <main className="dashboard">
                <div className="left-column">
                    {/*botões do menu lateral esquerdo*/}
                    <button className="card-btn" onClick={() => navigate('/Resource')}>
                        Gestão<br />de<br />Recursos
                    </button>
                    <button className="card-btn2" onClick={() => navigate('/GroupSharing')}>
                        Grupos<br /> de<br /> Partilha
                    </button>
                    <button className="card-btn3" onClick={() => navigate('/Services')}>
                        Prestação<br /> de<br /> Serviços
                    </button>
                </div>

                <div className="right-column">
                    {recursos.length > 0 ? (
                        recursos.slice(0, 2).map((recurso) => (
                            <InfoCardUnified
                                key={recurso.recursoId}
                                title={recurso.nome}
                                type={recurso.tipoRecurso?.nome || 'Não definido'}
                                value={recurso.preco}
                                id={recurso.recursoId}
                                variant="recurso"
                                onMoreInfo={() => handleMoreInfoClick(recurso)}
                            />

                        ))
                    ) : (
                        <div>Nenhum recurso disponível.</div>
                    )}

                    {grupos.length > 0 ? (
                        grupos.slice(0, 2).map((grupo) => (
                            <InfoCardUnified
                                key={grupo.grupoId}
                                title={grupo.nome}
                                type="Grupo de Partilha"
                                value="N/A"
                                id={grupo.grupoId}
                                variant="grupo"
                                onMoreInfo={() => handleMoreInfoClick(grupo)}
                            />
                        ))
                    ) : (
                        <div>Nenhum grupo de partilha ativo.</div>
                    )}

                    {servicos.length > 0 ? (
                        servicos.slice(0, 2).map((servico) => (
                            <InfoCardUnified
                                key={servico.servicoId}
                                title={servico.nome}
                                type={servico.tipoServico?.nome || 'Serviço'}
                                value={servico.preco}
                                id={servico.servicoId}
                                variant="servico"
                                onMoreInfo={() => handleMoreInfoClick(servico)}
                            />
                        ))
                    ) : (
                        <div>Nenhum serviço disponível.</div>
                    )}
                </div>
            </main>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <BotaoAcao
                            texto="X"
                            onClick={closePopup}
                            classe="close-btn"
                        />
                        {renderPopupContent()}
                    </div>
                </div>
            )}
        </div>
    );
}
