import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../styles/MyResource.css';
import BotaoAcao from '../components/BotaoAcao';

export default function PendingActions() {
    const { authToken, userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);

    const fetchPendentes = useCallback(async () => {
        try {
            const resp = await fetch('http://localhost:5053/api/recursoreserva', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await resp.json();
            const todas = data.$values || [];

            const detalhes = await Promise.all(
                todas.map(async (reserva) => {
                    const detalhadaResp = await fetch(`http://localhost:5053/api/recursoreserva/${reserva.reservaId}`, {
                        headers: { Authorization: `Bearer ${authToken}` },
                    });
                    if (!detalhadaResp.ok) return null;
                    return await detalhadaResp.json();
                })
            );

            const pendentes = detalhes.filter((r) =>
                r &&
                (
                    r.liquidado === false ||
                    r.multa === false ||
                    r.multaLiquidada === false ||
                    r.recursoDevolvido === false
                )
            );

            setReservas(pendentes);
        } catch (err) {
            console.error('Erro ao obter reservas pendentes:', err);
        }
    }, [authToken]);

    useEffect(() => {
        if (!authToken || !userInfo) return;
        fetchPendentes();
    }, [authToken, userInfo, fetchPendentes]);

    const handleAcao = async (id, acao) => {
        let endpoint = '';
        if (acao === 'pagar') endpoint = `liquidar/${id}`;
        if (acao === 'entrega') endpoint = `confirmar-entrega/${id}`;
        if (acao === 'multa') endpoint = `atualizar-multa/${id}`;
        if (acao === 'multa-liquidada') endpoint = `multa-liquidada/${id}`;

        try {
            const resp = await fetch(`http://localhost:5053/api/recursoreserva/${endpoint}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (resp.ok) {
                await fetchPendentes();
            } else {
                const msg = await resp.text();
                alert(`❌ Erro: ${msg}`);
            }
        } catch (err) {
            console.error('Erro ao executar ação:', err);
            alert('❌ Erro ao executar ação.');
        }
    };

    return (
        <div className="my-resources-container">
            <Header />
            <h1 className="main-title">Lista de Ações Pendentes</h1>

            <div className="MyResources-buttons" style={{ marginBottom: '2rem' }}>
                <BotaoAcao
                    texto=" ← Voltar aos Meus Anúncios"
                    onClick={() => navigate('/myresource')}
                    classe="MyResources-buttons_btn inactive"
                />
            </div>


            <div className="resources-grid">
                {reservas.length === 0 ? (
                    <p>Sem ações pendentes.</p>
                ) : (
                    reservas.map(reserva => (
                        <div className="card" key={reserva.reservaId}>
                            <div className="card-header">
                                <span>{reserva.recurso?.nome || 'Sem nome do recurso'}</span>
                            </div>
                            <p>Data de Entrega Prevista<br />{reserva.dataInicio}</p>
                            <p>Data de Devolução Prevista<br />{reserva.dataFim}</p>
                            <p>Comentário<br /><i>{reserva.comentario || 'Sem notas adicionais.'}</i></p>
                            <p>Valor<br /><strong>{reserva.recurso?.preco || 0} €</strong></p>
                            <p>Requisitante<br /><i>{reserva.utilizador?.nome || `ID: ${reserva.utilizadorId}`}</i></p>
                            <div className="filter-actions">
                                {reserva.liquidado === false && (
                                    <BotaoAcao
                                        texto="Confirmar Pagamento"
                                        onClick={() => handleAcao(reserva.reservaId, 'pagar')}
                                        classe="btn-acao"
                                    />

                                )}
                                {reserva.recursoDevolvido === false && (
                                    <BotaoAcao
                                        texto="Confirmar Entrega"
                                        onClick={() => handleAcao(reserva.reservaId, 'entrega')}
                                        classe="btn-acao"
                                    />

                                )}
                                {reserva.multa === false && (
                                    <BotaoAcao
                                        texto="Aplicar Multa"
                                        onClick={() => handleAcao(reserva.reservaId, 'multa')}
                                        classe="btn-acao"
                                    />
                                )}
                                {reserva.multa === true && reserva.multaLiquidada === false && (
                                    <BotaoAcao
                                        texto="Liquidar Multa"
                                        onClick={() => handleAcao(reserva.reservaId, 'multa-liquidada')}
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
