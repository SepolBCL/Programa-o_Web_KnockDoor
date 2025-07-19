import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/MyResource.css';
import { AuthContext } from '../contexts/AuthContext';
import AvaliationModal from '../components/AvaliationModal';
import InfoCardGenerico from '../components/InfoCardGenerico';
import BotaoAcao from '../components/BotaoAcao';
export default function RequestedServices() {
    const { authToken, userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [tipoServicoNomes, setTipoServicoNomes] = useState({});
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

    useEffect(() => {
        if (!authToken || !userInfo) return;

        const fetchData = async () => {
            try {
                const pedidosResp = await fetch('http://localhost:5053/api/pedidoservico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const pedidosData = await pedidosResp.json();
                const todosPedidos = pedidosData['$values'] || [];

                const servicosResp = await fetch('http://localhost:5053/api/servico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const servicosData = await servicosResp.json();
                const servicosPorId = {};
                (servicosData['$values'] || []).forEach(s => {
                    servicosPorId[s.servicoId] = s;
                });

                const meusPedidos = todosPedidos;

                const pedidosComServico = meusPedidos.map((p) => {
                    const servico = servicosPorId[p.servicoId] || {
                        nome: `Serviço #${p.servicoId}`,
                        preco: 0,
                        tipoServicoId: 0,
                        descricao: '',
                        servicoId: p.servicoId,
                    };
                    return {
                        ...servico,
                        pedidoInfo: p,
                    };
                });

                setPedidos(pedidosComServico);

                const pendentes = todosPedidos.filter(
                    (p) => servicosPorId[p.servicoId]?.prestadorId === userInfo.utilizadorId && p.estadoId === 2
                );
                setNotificacoesPendentes(pendentes.length);

                const tiposResp = await fetch('http://localhost:5053/api/tiposervico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const tiposData = await tiposResp.json();
                const nomesPorId = {};
                tiposData['$values'].forEach((t) => {
                    nomesPorId[t.tipoServicoId] = t.nome;
                });
                setTipoServicoNomes(nomesPorId);
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            }
        };

        fetchData();
    }, [authToken, userInfo]);

    const abrirModalAvaliacao = (pedido) => {
        setSelectedPedido(pedido);
        setShowModal(true);
        setShowDetalhes(false);
    };

    const abrirDetalhes = (pedido) => {
        setSelectedPedido(pedido);
        setShowDetalhes(true);
        setShowModal(false);
    };

    const fecharPopup = () => {
        setSelectedPedido(null);
        setShowModal(false);
        setShowDetalhes(false);
    };

    const atualizarAvaliacaoLocal = (id, novaPontuacao, novoComentario) => {
        setPedidos(prev =>
            prev.map((s) =>
                s.pedidoInfo.pedidoServicoId === id
                    ? {
                        ...s,
                        pedidoInfo: {
                            ...s.pedidoInfo,
                            pontuacao: novaPontuacao,
                            comentario: novoComentario,
                        },
                    }
                    : s
            )
        );
    };

    return (
        <div className="my-resources-container">
            <Header />
            <h1 className="main-title">Meus Pedidos de Serviço</h1>

            <div className="MyServices-buttons">
                <button className="MyServices-buttons_btn inactive" onClick={() => navigate('/MyServices')}>
                    Meus Serviços
                </button>
                <button className="MyServices-buttons_btn active" onClick={() => navigate('/RequestedServices')}>
                    Serviços Solicitados
                </button>
                <button className="MyServices-buttons_btn inactive" onClick={() => navigate('/PendingActionsServices')}>
                    Ações Pendentes{' '}
                    {notificacoesPendentes > 0 && <span className="badge">{notificacoesPendentes}</span>}
                </button>
            </div>

            <div className="resources-grid">
                {pedidos.length === 0 && <p>Não tens pedidos registados.</p>}
                {pedidos.map((servico) => {
                    const podeAvaliar = servico.pedidoInfo.estadoId === 4;

                    return (
                        <InfoCardGenerico
                            key={`${servico.servicoId}-${servico.pedidoInfo.pedidoServicoId}`}
                            titulo={servico.nome}
                            subtitulo={`Tipo: ${tipoServicoNomes[servico.tipoServicoId] || `ID ${servico.tipoServicoId}`}`}
                            descricao={servico.descricao}
                            status={!podeAvaliar ? { texto: 'AÇÕES PENDENTES', cor: 'orange' } : null}
                            imagemSrc={`http://localhost:5053/images/servicos/servico${servico.servicoId}.jpg`}
                            textoAcao={podeAvaliar ? 'Avaliar' : 'Mais Info'}
                            onAcao={() => podeAvaliar ? abrirModalAvaliacao(servico) : abrirDetalhes(servico)}
                        >
                            <p className="resource-rating">
                                Avaliação: {servico.pedidoInfo.pontuacao > 0 ? `${servico.pedidoInfo.pontuacao} ★` : 'Sem avaliações'}
                            </p>
                            {servico.pedidoInfo.comentario && (
                                <p className="resource-comment">
                                    <strong>Comentário:</strong> <i>{servico.pedidoInfo.comentario}</i>
                                </p>
                            )}
                            <p className="resource-dates">
                                De: {new Date(servico.pedidoInfo.dataInicio).toLocaleDateString()} <br />
                                Até: {new Date(servico.pedidoInfo.dataFim).toLocaleDateString()}
                            </p>
                        </InfoCardGenerico>
                    );
                })}
            </div>

            {showModal && selectedPedido && (
                <AvaliationModal
                    tipo="servico"
                    id={selectedPedido.pedidoInfo.pedidoServicoId}
                    authToken={authToken}
                    onClose={fecharPopup}
                    pontuacaoInicial={selectedPedido.pedidoInfo.pontuacao}
                    comentarioInicial={selectedPedido.pedidoInfo.comentario}
                    onSuccess={(pontuacao, comentario) => {
                        atualizarAvaliacaoLocal(selectedPedido.pedidoInfo.pedidoServicoId, pontuacao, comentario);
                        fecharPopup();
                    }}
                />
            )}

            {showDetalhes && selectedPedido && (
                <div className="popup-overlay">
                    <div className="popup-content2">
                        <h2>{selectedPedido.nome}</h2>
                        <p><strong>Tipo:</strong> {tipoServicoNomes[selectedPedido.tipoServicoId] || `ID ${selectedPedido.tipoServicoId}`}</p>
                        <p><strong>Preço:</strong> {selectedPedido.preco}€</p>
                        <p><strong>Descrição:</strong> {selectedPedido.descricao || 'Sem descrição.'}</p>
                        <p><strong>Comentário:</strong> {selectedPedido.pedidoInfo.comentario || 'Sem comentário.'}</p>
                        <BotaoAcao
                            texto="Fechar"
                            onClick={fecharPopup}
                            classe="btn00"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
