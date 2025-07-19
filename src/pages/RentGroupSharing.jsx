import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/RentGroupSharing.css';
import { AuthContext } from '../contexts/AuthContext';
import BotaoAcao from '../components/BotaoAcao';
export default function RentGroupSharing() {
    const { authToken, userInfo, communityInfo } = useContext(AuthContext);
    const { grupoId } = useParams();
    const navigate = useNavigate();

    const [grupo, setGrupo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!authToken) {
            setError('⚠ Autenticação necessária.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const fetchGrupo = async () => {
            try {
                const response = await fetch(`http://localhost:5053/api/grupopartilha/${grupoId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (!response.ok) throw new Error('Erro ao carregar grupo.');
                const data = await response.json();
                setGrupo(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGrupo();
    }, [authToken, grupoId, navigate]);

    const handleJoinGroup = async () => {
        if (!userInfo?.utilizadorId || !grupo || !communityInfo?.comunidadeId) {
            setError('⚠ Dados insuficientes para aderir.');
            return;
        }

        setSubmitting(true);
        try {
            const membrosResp = await fetch('http://localhost:5053/api/membrogrupo', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const membros = await membrosResp.json();
            const jaExiste = membros.$values?.some(
                m => m.utilizadorId === userInfo.utilizadorId && m.grupoId === parseInt(grupoId)
            );
            if (jaExiste) {
                setError('⚠ Já foi feito um pedido.');
                return;
            }

            const payload = {
                comunidadeId: grupo.comunidadeId,
                utilizadorId: userInfo.utilizadorId,
                grupoId: parseInt(grupoId),
                estadoId: 2,
                dataAdesao: new Date().toISOString().split('T')[0],
                comunidadeUtilizador: null,
                estado: null,
                grupo: null
            };

            const resp = await fetch('http://localhost:5053/api/membrogrupo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) throw new Error('Erro ao enviar pedido.');
            setSuccess('✔ Pedido enviado!');
            setTimeout(() => navigate('/GroupSharing'), 2000);
        } catch (err) {
            setError(err.message || '❌ Erro ao aderir.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="group-loading">A carregar...</p>;

    return (
        <div className="groupsharing-container" >
            <Header />
            <h1 className="groupsharing-title">Detalhes do Grupo</h1>

            <div className="groupsharing-details">
                <div className="group-panel nome">
                    
                    <h3>Nome do Grupo</h3>
                    <p>{grupo.nome}</p>
                </div>

                <div className="group-panel descricao">
                    <h3>Descrição</h3>
                    <p>{grupo.descricao || 'Sem descrição.'}</p>
                </div>

                <div className="group-panel estado">
                    <h3>Estado</h3>
                    <p className={`status-label ${grupo.estadoId === 2 ? 'available' : 'unavailable'}`}>
                        {grupo.estadoId === 2 ? 'ATIVO' : 'INATIVO'}
                    </p>
                </div>

                <div className="group-panel regra">
                    <h3>Regra</h3>
                    <p>{grupo.regraGrupoId === 2 ? 'Regra Especial' : 'Regra Padrão'}</p>
                </div>

                <div className="group-panel datacriacao">
                    <h3>Data de Criação</h3>
                    <p>{new Date(grupo.dataCriacao).toLocaleDateString()}</p>
                </div>

                <div className="group-image-panel">
                    <img
                        src={`http://localhost:5053/images/grupos/grupo${grupo.grupoId}.jpg`}
                        alt="Imagem do Grupo"
                        onError={(e) => { e.target.src = 'http://localhost:5053/images/sem-foto.jpg'; }}
                    />
                </div>
            </div>

            <div className="groupsharing-actions" style={{ color: '#365b99' }}>
                <BotaoAcao
                    
                    texto="Cancelar"
                    onClick={() => navigate('/GroupSharing')}
                    classe="btn06-cancelar"
                />

                <button
                    className="btn06-confirmar"
                    onClick={handleJoinGroup}
                    disabled={submitting || grupo.estadoId !== 2}
                >
                    {submitting ? 'A processar...' : 'Concluir'}
                </button>
            </div>

            {error && <p className="group-error">{error}</p>}
            {success && <p className="group-success">{success}</p>}
        </div>
    );
}
