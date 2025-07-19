import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/MyResource.css';
import { FiArrowLeft } from 'react-icons/fi';
import BotaoAcao from '../components/BotaoAcao';

export default function AprovalMember() {
    const { authToken, userInfo } = useContext(AuthContext);
    const [pedidos, setPedidos] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const gruposResp = await fetch('http://localhost:5053/api/grupopartilha', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const gruposData = await gruposResp.json();
                const meusGrupos = gruposData.$values?.filter(
                    g => g.responsavelId === userInfo.utilizadorId
                ) || [];
                const idsGrupos = meusGrupos.map(g => g.grupoId);

                const membrosResp = await fetch('http://localhost:5053/api/membrogrupo', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const membrosData = await membrosResp.json();
                const pedidosBrutos = membrosData.$values?.filter(
                    (m) => m.estadoId === 1 && idsGrupos.includes(m.grupoId)
                ) || [];

                const pedidosCompletos = await Promise.all(
                    pedidosBrutos.map(async (m) => {
                        const [grupo, utilizador, comunidade] = await Promise.all([
                            fetch(`http://localhost:5053/api/grupopartilha/${m.grupoId}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            }).then(r => r.ok ? r.json() : null),

                            fetch(`http://localhost:5053/api/utilizador/${m.utilizadorId}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            }).then(r => r.ok ? r.json() : null),

                            fetch(`http://localhost:5053/api/comunidade/${m.comunidadeId}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            }).then(r => r.ok ? r.json() : null)
                        ]);

                        return {
                            ...m,
                            grupo,
                            utilizador,
                            comunidade
                        };
                    })
                );

                setPedidos(pedidosCompletos);
            } catch (err) {
                console.error('Erro ao carregar dados de adesão:', err);
            }
        };

        if (authToken && userInfo) fetchDados();
    }, [authToken, userInfo]);

    const alterarEstado = async (id, novoEstado) => {
        try {
            const resp = await fetch(`http://localhost:5053/api/membrogrupo/estado/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify(novoEstado)
            });

            if (!resp.ok) {
                const msg = await resp.text();
                alert(`Erro: ${msg}`);
                return;
            }

            setPedidos((prev) => prev.filter((p) => p.membroId !== id));

            if (novoEstado === 2) {
                setMensagem('✔ Adesão confirmada com sucesso.');
            } else if (novoEstado === 3) {
                setMensagem('❌ Pedido de adesão rejeitado.');
            }

            setTimeout(() => setMensagem(''), 3000);
        } catch (err) {
            console.error('Erro ao atualizar estado:', err);
            alert('Erro ao atualizar estado do membro.');
        }
    };

    return (
        <div className="my-resources-container">
            <Header />
            <h1 className="main-title">Pedidos de Adesão ao Grupo</h1>

            <div className="MyResources-buttons" style={{ marginBottom: '2rem' }}>
                <BotaoAcao
                    texto={<><FiArrowLeft /> Voltar aos Meus Grupos</>}
                    onClick={() => navigate('/mygroupsharing')}
                    classe="MyResources-buttons_btn inactive"
                />
            </div>

            {mensagem && (
                <div className="success-alert" style={{ marginBottom: '1.5rem' }}>
                    {mensagem}
                </div>
            )}

            <div className="resources-grid">
                {pedidos.length === 0 ? (
                    <p>Sem pedidos de adesão pendentes.</p>
                ) : (
                    pedidos.map((m) => (
                        <div className="card" key={m.membroId}>
                            <div className="card-header">
                                <span>{m.grupo?.nome || 'Grupo desconhecido'}</span>
                            </div>
                            <p><strong>Utilizador:</strong> {m.utilizador?.nome || `ID: ${m.utilizadorId}`}</p>
                            <p><strong>Email:</strong> {m.utilizador?.email || '---'}</p>
                            <p><strong>Comunidade:</strong> {m.comunidade?.nome || '---'}</p>


                            <div className="filter-actions">

                                <BotaoAcao
                                    texto="Confirmar Adesão"
                                    onClick={() => alterarEstado(m.membroId, 2)}
                                    classe="btn-acao"
                                />
                                <BotaoAcao
                                    texto="Rejeitar Adesão"
                                    onClick={() => alterarEstado(m.membroId, 3)}
                                    classe="btn-acao"
                                />

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
