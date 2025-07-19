import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/MyResource.css';
import { AuthContext } from '../contexts/AuthContext';
import InfoCardGenerico from '../components/InfoCardGenerico';
import BotaoAcao from '../components/BotaoAcao';

export default function MyResource() {
    const { authToken, userInfo, communityInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('anuncios');
    const [meusRecursos, setMeusRecursos] = useState([]);
    const [recursosAlugados, setRecursosAlugados] = useState([]);

    const [editRecurso, setEditRecurso] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [tipoRecursoNomes, setTipoRecursoNomes] = useState({});
    const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

    useEffect(() => {
        if (!authToken || !userInfo || !communityInfo) return;

        const fetchData = async () => {
            try {
                const recursosResp = await fetch('http://localhost:5053/api/recurso', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const recursosData = await recursosResp.json();
                const recursos = recursosData['$values'];

                const meus = recursos.filter(
                    (r) =>
                        r.utilizadorId === userInfo.utilizadorId &&
                        r.comunidadeId === communityInfo.comunidadeId
                );
                setMeusRecursos(meus);

                const reservasResp = await fetch('http://localhost:5053/api/recursoreserva', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const reservasData = await reservasResp.json();
                const reservas = reservasData['$values'];

                const minhasReservas = reservas.filter(
                    (reserva) =>
                        reserva.utilizadorId === userInfo.utilizadorId &&
                        reserva.recurso?.comunidadeId === communityInfo.comunidadeId
                );

                const alugados = minhasReservas
                    .filter((reserva) => reserva.recurso)
                    .map((reserva) => ({
                        ...reserva.recurso,
                        reservaInfo: reserva
                    }));
                setRecursosAlugados(alugados);

                const tiposResp = await fetch('http://localhost:5053/api/tiporecurso', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const tiposData = await tiposResp.json();
                const tipos = tiposData['$values'];

                const nomes = {};
                tipos.forEach((t) => {
                    nomes[t.tipoRecursoId] = t.nome;
                });
                setTipoRecursoNomes(nomes);

                const pendentes = reservas.filter(
                    (r) =>
                        r.recurso?.utilizadorId === userInfo.utilizadorId &&
                        (
                            r.liquidado === false ||
                            r.multa === false ||
                            r.multaLiquidada === false ||
                            r.recursoDevolvido === false
                        )
                );
                setNotificacoesPendentes(pendentes.length);

            } catch (error) {
                console.error('Erro ao obter dados:', error);
            }
        };

        fetchData();
    }, [authToken, userInfo, communityInfo]);

    const abrirDetalhes = (recurso) => {
        setEditRecurso({ ...recurso });
        setShowPopup(true);
    };

    const fecharDetalhes = () => {
        setShowPopup(false);
        setEditRecurso(null);
    };

    const atualizarRecurso = async (recursoAtualizado) => {
        try {
            const resp = await fetch(`http://localhost:5053/api/recurso/${recursoAtualizado.recursoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(recursoAtualizado),
            });

            if (!resp.ok) throw new Error('Erro ao atualizar recurso');

            fecharDetalhes();
            window.location.reload();
        } catch (err) {
            console.error('Erro ao atualizar:', err);
            alert('Erro ao atualizar recurso.');
        }
    };

    return (
        <div className="my-resources-container">
            <Header />
            <h1 className="main-title">Meus Recursos</h1>

            <div className="MyResources-topbar">
                <div className="MyResources-buttons">
                    <button
                        className={`MyResources-buttons_btn ${activeTab === 'anuncios' ? 'active' : 'inactive'}`}
                        onClick={() => setActiveTab('anuncios')}
                    >
                        Meus Anúncios
                    </button>
                    <button
                        className={`MyResources-buttons_btn inactive`}
                        onClick={() => navigate('/MyRentals')}
                    >
                        Meus Alugueres
                    </button>

                    <button
                        className="MyResources-buttons_btn inactive" onClick={() => navigate('/pendingActions')}>
                        Ações Pendentes  {notificacoesPendentes > 0 && (
                            <span className="badge">{notificacoesPendentes}</span>
                        )}

                    </button>


                </div>
            </div>

            <div className="resources-grid">
                {activeTab === 'anuncios' &&
                    <>
                        <div className="card add-card" onClick={() => navigate('/add-resource')}>
                            <span className="plus-icon"style={{ fontSize: '80px' }}>＋</span>
                            <p>Adicionar Recursos</p>
                        </div>
                        {meusRecursos.map((recurso) => (
                            <InfoCardGenerico
                                key={recurso.recursoId}
                                titulo={recurso.nome}
                                subtitulo={`Tipo: ${tipoRecursoNomes[recurso.tipoRecursoId] || `ID ${recurso.tipoRecursoId}`}`}
                                descricao={recurso.descricao}
                                status={{ texto: recurso.disponibilidade ? 'DISPONÍVEL' : 'EM UTILIZAÇÃO', cor: recurso.disponibilidade ? 'green' : 'yellow' }}
                                imagemSrc={`http://localhost:5053/images/recursos/recurso${recurso.recursoId}.jpg`}
                                textoAcao="Editar"
                                onAcao={() => abrirDetalhes(recurso)}
                            >
                                <p className="resource-rating">Avaliações <span>Sem avaliações</span></p>
                            </InfoCardGenerico>
                        ))}
                    </>
                }

                {activeTab === 'alugueres' &&
                    recursosAlugados.map((recurso) => (
                        <InfoCardGenerico
                            key={`${recurso.recursoId}-${recurso.reservaInfo.reservaId}`}
                            titulo={recurso.nome}
                            subtitulo={`Tipo: ${tipoRecursoNomes[recurso.tipoRecursoId] || `ID ${recurso.tipoRecursoId}`}`}
                            status={{ texto: 'EM UTILIZAÇÃO', cor: 'yellow' }}
                            imagemSrc={`http://localhost:5053/images/recursos/recurso${recurso.recursoId}.jpg`}
                            textoAcao="Mais Info"
                            onAcao={() => abrirDetalhes(recurso)}
                        >
                            <p className="resource-rating">
                                Avaliações: <span>{recurso.reservaInfo.pontuacao > 0 ? recurso.reservaInfo.pontuacao + ' ★' : 'Sem avaliações'}</span>
                            </p>
                            <p className="resource-dates">
                                De: {new Date(recurso.reservaInfo.dataInicio).toLocaleDateString()} <br />
                                Até: {new Date(recurso.reservaInfo.dataFim).toLocaleDateString()}
                            </p>
                        </InfoCardGenerico>
                    ))
                }
            </div>

            {showPopup && editRecurso && (
                <div className="popup-overlay">
                    <div className="popup-content2">
                        <h2>Editar Recurso</h2>
                        <label>Nome:
                            <input type="text" value={editRecurso.nome} onChange={(e) => setEditRecurso({ ...editRecurso, nome: e.target.value })} />
                        </label>
                        <label>Descrição:
                            <textarea value={editRecurso.descricao} onChange={(e) => setEditRecurso({ ...editRecurso, descricao: e.target.value })} />
                        </label>
                        <label>Preço (€):
                            <input type="number" value={editRecurso.preco} onChange={(e) => setEditRecurso({ ...editRecurso, preco: parseFloat(e.target.value) })} />
                        </label>
                        <label>Disponibilidade:
                            <select value={editRecurso.disponibilidade.toString()} onChange={(e) => setEditRecurso({ ...editRecurso, disponibilidade: e.target.value === 'true' })}>
                                <option value="true">Disponível</option>
                                <option value="false">Indisponível</option>
                            </select>
                        </label>
                        <div className="modal-buttons">
                            <BotaoAcao
                                texto="Guardar"
                                onClick={() => atualizarRecurso(editRecurso)}
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
        </div>
    );
}
