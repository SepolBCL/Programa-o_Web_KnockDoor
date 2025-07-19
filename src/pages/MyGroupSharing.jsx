import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/MyGroupSharing.css';
import { AuthContext } from '../contexts/AuthContext';
import InfoCardGenerico from '../components/InfoCardGenerico';
import BotaoAcao from '../components/BotaoAcao';

export default function MyGroupSharing() {
    const { authToken, userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [meusGrupos, setMeusGrupos] = useState([]);
    const [editGrupo, setEditGrupo] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [pendentes, setPendentes] = useState(0);

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/grupopartilha', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await response.json();
                const todos = data['$values'];

                const gruposResponsavel = todos.filter(
                    (grupo) => grupo.responsavelId === userInfo.utilizadorId
                );

                setMeusGrupos(gruposResponsavel);
            } catch (error) {
                console.error('Erro ao obter grupos de partilha:', error);
            }
        };

        fetchGrupos();
    }, [authToken, userInfo]);

    useEffect(() => {
        const fetchPendentes = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/membrogrupo', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await response.json();
                const todos = data['$values'] || [];

                const pedidosPendentes = todos.filter(
                    m => m.estadoId === 1 && meusGrupos.some(g => g.grupoId === m.grupoId)
                );
                setPendentes(pedidosPendentes.length);
            } catch (err) {
                console.error('Erro ao obter pedidos pendentes:', err);
            }
        };

        if (meusGrupos.length > 0) {
            fetchPendentes();
        }
    }, [authToken, meusGrupos]);

    const abrirDetalhes = (grupo) => {
        setEditGrupo({ ...grupo });
        setShowPopup(true);
    };

    const fecharDetalhes = () => {
        setShowPopup(false);
        setEditGrupo(null);
    };

    const atualizarGrupo = async (grupoAtualizado) => {
        try {
            const resp = await fetch(`http://localhost:5053/api/grupopartilha/${grupoAtualizado.grupoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(grupoAtualizado),
            });

            if (!resp.ok) throw new Error('Erro ao atualizar grupo');

            fecharDetalhes();
            window.location.reload();
        } catch (err) {
            console.error('Erro ao atualizar:', err);
            alert('Erro ao atualizar grupo.');
        }
    };

    return (
        <>
            <main className="my-group-sharing-container">
                <Header />

                <div className="MyResources-topbar">
                    <h1 className="main-title">Meus Grupos de Partilha</h1>
                    <button
                        className="MyResources-buttons_btn inactive"
                        onClick={() => navigate('/AprovalMember')}
                        style={{ marginLeft: '2rem' }}
                    >
                        Ações Pendentes {pendentes > 0 && (<span className="badge">{pendentes}</span>)}
                    </button>
                </div>

                <div className="resources-grid">
                    <div className="card add-card" onClick={() => navigate('/add-groupsharing')}>
                        <span className="plus-icon" style={{ fontSize: '80px' }}>＋</span>
                        <p>Adicionar Grupo</p>
                    </div>

                    {meusGrupos.map((grupo) => (
                        <InfoCardGenerico
                            key={grupo.grupoId}
                            titulo={grupo.nome}
                            subtitulo={grupo.descricao}
                            status={{
                                texto: formatarEstado(grupo.estadoId),
                                cor: grupo.estadoId === 2 ? 'green' : 'gray'
                            }}
                            imagemSrc={`http://localhost:5053/images/grupos/grupo${grupo.grupoId || 'default'}.jpg`}
                            textoAcao="Editar"
                            onAcao={() => abrirDetalhes(grupo)}
                        >
                            <p className="resource-rating">Criado em: {new Date(grupo.dataCriacao).toLocaleDateString()}</p>
                        </InfoCardGenerico>
                    ))}
                </div>
            </main>

            {showPopup && editGrupo && (
                <div className="popup-overlay">
                    <div className="popup-content2">
                        <h2>Editar Grupo</h2>
                        <label>Nome:
                            <input type="text" value={editGrupo.nome} onChange={(e) => setEditGrupo({ ...editGrupo, nome: e.target.value })} />
                        </label>
                        <label>Descrição:
                            <textarea value={editGrupo.descricao} onChange={(e) => setEditGrupo({ ...editGrupo, descricao: e.target.value })} />
                        </label>
                        <label>Estado:
                            <select
                                value={editGrupo.estadoId}
                                onChange={(e) => setEditGrupo({ ...editGrupo, estadoId: parseInt(e.target.value) })}
                            >
                                <option value="2">Ativo</option>
                                <option value="4">Inativo</option>
                            </select>
                        </label>
                        <div className="modal-buttons">
                            <BotaoAcao
                                texto="Guardar"
                                onClick={() => atualizarGrupo(editGrupo)}
                                classe="btn-submit"
                            />
                            <BotaoAcao
                                texto="Cancelar"
                                onClick={fecharDetalhes}
                                classe="btn-cancel"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function formatarEstado(estadoId) {
    return estadoId === 2 ? 'Ativo' : 'Inativo';
}
