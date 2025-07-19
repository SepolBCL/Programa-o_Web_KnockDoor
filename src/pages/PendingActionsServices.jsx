import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../styles/MyServices.css';
import BotaoAcao from '../components/BotaoAcao';
export default function PendingActionsServices() {
    const { authToken, userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pedidosPendentes, setPedidosPendentes] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchPendentes = useCallback(async () => {
        try {
            const respPedidos = await fetch('http://localhost:5053/api/pedidoservico', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const pedidosData = await respPedidos.json();
            const todos = pedidosData.$values || [];

            const respServicos = await fetch('http://localhost:5053/api/servico', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const servicosData = await respServicos.json();
            const servicosPorId = {};
            servicosData.$values.forEach(s => {
                servicosPorId[s.servicoId] = s;
            });

            const respUtilizadores = await fetch('http://localhost:5053/api/utilizador', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const utilizadoresData = await respUtilizadores.json();
            const utilizadoresPorId = {};
            utilizadoresData.$values.forEach(u => {
                utilizadoresPorId[u.utilizadorId] = u;
            });

            const pendentes = todos
                .filter(p => [1, 2].includes(p.estadoId)) // Aceite ou Pendente
                .filter(p => servicosPorId[p.servicoId]?.prestadorId === userInfo.utilizadorId)
                .map(p => ({
                    ...p,
                    servico: servicosPorId[p.servicoId] || { nome: `Serviço #${p.servicoId}` },
                    solicitante: utilizadoresPorId[p.solicitanteId] || { nome: `ID: ${p.solicitanteId}` }
                }));

            setPedidosPendentes(pendentes);
        } catch (err) {
            console.error('Erro ao obter pedidos de serviço pendentes:', err);
        }
    }, [authToken, userInfo]);

    useEffect(() => {
        if (!authToken || !userInfo) return;
        fetchPendentes();
    }, [authToken, userInfo, fetchPendentes]);

    const alterarEstado = async (id, novoEstadoId) => {
        try {
            const resp = await fetch(`http://localhost:5053/api/pedidoservico/estado/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify(novoEstadoId)
            });

            const msg = await resp.text();

            if (resp.ok) {
                setSuccessMessage(msg);
                await fetchPendentes();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(`❌ Erro: ${msg}`);
            }
        } catch (err) {
            console.error('Erro ao alterar estado:', err);
            alert('❌ Erro ao alterar estado.');
        }
    };

    return (
        <div className="my-resources-container">
            <Header />
            <h1 className="main-title">Serviços Pendentes</h1>

            {successMessage && (
                <div className="success-alert">
                    ✅ {successMessage}
                </div>
            )}

            <div className="MyResources-buttons" style={{ marginBottom: '2rem' }}>
                <BotaoAcao
                    texto="← Voltar aos Meus Serviços"
                    onClick={() => navigate('/myservices')}
                    classe="MyResources-buttons_btn inactive"
                />

            </div>

            <div className="resources-grid">
                {pedidosPendentes.length === 0 ? (
                    <p>Sem pedidos pendentes.</p>
                ) : (
                    pedidosPendentes.map(pedido => (
                        <div className="card" key={pedido.pedidoServicoId}>
                            <div className="card-header">
                                <span>{pedido.servico?.nome || 'Serviço sem nome'}</span>
                            </div>
                            <p>De: {new Date(pedido.dataInicio).toLocaleDateString()}</p>
                            <p>Até: {new Date(pedido.dataFim).toLocaleDateString()}</p>
                            <p>Comentário<br /><i>{pedido.comentario || 'Sem comentário.'}</i></p>
                            <p>Solicitante<br /><strong>{pedido.solicitante?.nome || `ID: ${pedido.solicitanteId}`}</strong></p>
                            <div className="filter-actions">
                                {pedido.estadoId === 2 && (
                                    <>
                                        <BotaoAcao
                                            texto="Confirmar Serviço"
                                            onClick={() => alterarEstado(pedido.pedidoServicoId, 1)}
                                            classe="btn-acao"
                                        />
                                        <BotaoAcao
                                            texto="Rejeitar Serviço"
                                            onClick={() => alterarEstado(pedido.pedidoServicoId, 3)}
                                            classe="btn-acao"
                                        />


                                    </>
                                )}

                                {pedido.estadoId === 1 && (
                                    <BotaoAcao
                                        texto="Confirmar Pagamento"
                                        onClick={() => alterarEstado(pedido.pedidoServicoId, 4)}
                                        classe="btn-acao"
                                    />

                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
