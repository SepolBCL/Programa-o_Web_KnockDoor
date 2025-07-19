import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/MyServices.css';
import { AuthContext } from '../contexts/AuthContext';
import InfoCardGenerico from '../components/InfoCardGenerico';
import BotaoAcao from '../components/BotaoAcao';

export default function MyServices() {
    const { authToken, userInfo, communityInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('anuncios');
    const [servicos, setServicos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [tiposServico, setTiposServico] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

    useEffect(() => {
        if (!authToken || !userInfo || !communityInfo) return;

        const fetchTiposServico = async () => {
            try {
                const res = await fetch('http://localhost:5053/api/tiposervico', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await res.json();
                setTiposServico(data.$values || []);
            } catch (err) {
                console.error('Erro ao buscar tipos de serviço:', err);
            }
        };

        const fetchData = async () => {
            try {
                const servicosRes = await fetch('http://localhost:5053/api/servico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const servicosData = await servicosRes.json();
                const meusServicos = (servicosData.$values || []).filter(
                    (s) => s.prestadorId === userInfo.utilizadorId && s.comunidadeId === communityInfo.comunidadeId
                );
                setServicos(meusServicos);

                const pedidosRes = await fetch('http://localhost:5053/api/pedidoservico', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const pedidosData = await pedidosRes.json();
                const meusPedidos = (pedidosData.$values || []).filter(
                    (p) => p.solicitanteId === userInfo.utilizadorId
                );
                setPedidos(meusPedidos);

                const pendentes = pedidosData.$values?.filter(
                    (p) => p.servico?.prestadorId === userInfo.utilizadorId && p.estado === 'Pendente'
                );
                setNotificacoesPendentes(pendentes.length);
            } catch (err) {
                console.error('Erro ao buscar dados de serviços ou pedidos:', err);
            }
        };

        fetchTiposServico();
        fetchData();
    }, [authToken, userInfo, communityInfo]);

    const abrirDetalhes = (item) => {
        setSelectedItem(item);
        setShowDetalhes(true);
    };

    const fecharPopup = () => {
        setSelectedItem(null);
        setShowDetalhes(false);
    };

    return (
        <><main className="my-services-container">
            <Header />

            <h1 className="main-title">Meus Serviços</h1>

            {successMessage && <div className="success-alert">{successMessage}</div>}

            <div className="MyServices-buttons">

                <button
                    className={`MyServices-buttons_btn ${activeTab === 'anuncios' ? 'active' : 'inactive'}`}
                    onClick={() => setActiveTab('anuncios')}
                >
                    Meus Serviços
                </button>
                <button
                    className="MyServices-buttons_btn inactive"
                    onClick={() => navigate('/RequestedServices')}
                >
                    Serviços Solicitados
                </button>
                <button
                    className="MyServices-buttons_btn inactive"
                    onClick={() => navigate('/PendingActionsServices')}
                >
                    Ações Pendentes{' '}
                    {notificacoesPendentes > 0 && (
                        <span className="badge">{notificacoesPendentes}</span>
                    )}
                </button>
            </div>

            <div className="resources-grid">
                {activeTab === 'anuncios' && (
                    <div className="card add-card" onClick={() => navigate('/add-service')}>
                        <span className="plus-icon"style={{ fontSize: '80px' }}>＋</span>
                        <p>Adicionar Serviços</p>
                    </div>
                )}

                {activeTab === 'anuncios'
                    ? servicos.map((servico) => (
                        <InfoCardGenerico
                            key={servico.servicoId}
                            titulo={servico.nome}
                            subtitulo={`€ ${servico.preco.toFixed(2)}`}
                            descricao={servico.descricao}
                            status={{ texto: servico.disponibilidade ? 'DISPONÍVEL' : 'INDISPONÍVEL', cor: servico.disponibilidade ? 'green' : 'red' }}
                            imagemSrc={`http://localhost:5053/images/servicos/servico${servico.servicoId}.jpg`}
                            textoAcao="Editar"
                            onAcao={() => abrirDetalhes(servico)}
                        >
                            <p className="resource-rating">Avaliações <span>Sem avaliações</span></p>
                        </InfoCardGenerico>
                    ))

                    : pedidos.map((pedido) => (
                        <InfoCardGenerico
                            key={pedido.pedidoServicoId}
                            titulo={`Serviço #${pedido.servicoId}`}
                            subtitulo={`De ${pedido.dataInicio} até ${pedido.dataFim}`}
                            status={{ texto: pedido.estado, cor: 'yellow' }}
                            imagemSrc={`http://localhost:5053/images/servicos/servico${pedido.servicoId}.jpg`}
                            textoAcao="Mais Info"
                            onAcao={() => abrirDetalhes(pedido)}
                        >
                            <p className="resource-rating">
                                Avaliação <span>{pedido.pontuacao > 0 ? '⭐'.repeat(pedido.pontuacao) : 'Sem avaliações'}</span>
                            </p>
                        </InfoCardGenerico>
                    ))}
            </div>

            {showDetalhes && selectedItem && (
                <div className="popup-overlay">
                    <div className="popup-content2">
                        <h2>Editar Serviço</h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                const payload = {
                                    servicoId: selectedItem.servicoId,
                                    nome: selectedItem.nome,
                                    descricao: selectedItem.descricao,
                                    preco: parseFloat(selectedItem.preco),
                                    disponibilidade: selectedItem.disponibilidade === 'true' || selectedItem.disponibilidade === true,
                                    tipoServicoId: parseInt(selectedItem.tipoServicoId),
                                    comunidadeId: selectedItem.comunidadeId,
                                    prestadorId: selectedItem.prestadorId,
                                    dataCriacao: selectedItem.dataCriacao
                                };

                                try {
                                    const res = await fetch(`http://localhost:5053/api/servico/${selectedItem.servicoId}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${authToken}`
                                        },
                                        body: JSON.stringify(payload)
                                    });

                                    if (res.ok) {
                                        setSuccessMessage('✅ Serviço atualizado com sucesso.');
                                        setTimeout(() => setSuccessMessage(''), 3000);
                                        setServicos((prev) =>
                                            prev.map(s => s.servicoId === payload.servicoId ? { ...s, ...payload } : s)
                                        );

                                        fecharPopup();
                                    } else {
                                        const err = await res.text();
                                        alert('❌ Erro: ' + err);
                                    }
                                } catch (error) {
                                    console.error(error);
                                    alert('❌ Erro ao atualizar serviço.');
                                }
                            }}
                        >
                            <label>Nome</label>
                            <input
                                type="text"
                                value={selectedItem.nome}
                                onChange={(e) => setSelectedItem({ ...selectedItem, nome: e.target.value })}
                            />

                            <label>Descrição</label>
                            <textarea
                                value={selectedItem.descricao}
                                onChange={(e) => setSelectedItem({ ...selectedItem, descricao: e.target.value })}
                            />

                            <label>Preço (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={selectedItem.preco}
                                onChange={(e) => setSelectedItem({ ...selectedItem, preco: e.target.value })}
                            />

                            <label>Disponibilidade</label>
                            <select
                                value={selectedItem.disponibilidade.toString()}
                                onChange={(e) => setSelectedItem({ ...selectedItem, disponibilidade: e.target.value })}
                            >
                                <option value="true">Disponível</option>
                                <option value="false">Indisponível</option>
                            </select>

                            <label>Tipo de Serviço</label>
                            <select
                                value={selectedItem.tipoServicoId}
                                onChange={(e) => setSelectedItem({ ...selectedItem, tipoServicoId: e.target.value })}
                            >
                                {tiposServico.map((tipo) => (
                                    <option key={tipo.tipoServicoId} value={tipo.tipoServicoId}>
                                        {tipo.nome}
                                    </option>
                                ))}
                            </select>

                            <label>Alterar Imagem</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const image = e.target.files[0];
                                    const formData = new FormData();
                                    formData.append('imagem', image);
                                    fetch(`http://localhost:5053/api/servico/upload-imagem/${selectedItem.servicoId}`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${authToken}` },
                                        body: formData
                                    })
                                        .then(() => setSuccessMessage('📷 Imagem atualizada.'))
                                        .catch(() => alert('❌ Erro ao enviar imagem.'));
                                }}
                            />

                            <div style={{ marginTop: '1rem' }}>
                                <BotaoAcao
                                    texto="Guardar Alterações"
                                    type="submit"
                                    classe="btn confirm"
                                />
                                <BotaoAcao
                                    texto="Cancelar"
                                    type="button"
                                    onClick={fecharPopup}
                                    classe="btn cancel"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main></>
    );
}