import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/RequestService.css';
import { AuthContext } from '../contexts/AuthContext';

export default function RequestService() {
  const { authToken, userInfo } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [servico, setServico] = useState(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [prestadorNome, setPrestadorNome] = useState('');
  const [comunidadeNome, setComunidadeNome] = useState('');

  useEffect(() => {
    if (!authToken) return;

    const fetchServico = async () => {
      try {
        const resp = await fetch(`http://localhost:5053/api/servico/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!resp.ok) throw new Error('Erro ao carregar serviço');
        const data = await resp.json();
        setServico(data);

        const prestadorResp = await fetch(`http://localhost:5053/api/utilizador/${data.prestadorId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const prestadorData = await prestadorResp.json();
        setPrestadorNome(prestadorData.nome);

        const comunidadeResp = await fetch(`http://localhost:5053/api/comunidade/${data.comunidadeId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const comunidadeData = await comunidadeResp.json();
        setComunidadeNome(comunidadeData.nome);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o serviço.');
      } finally {
        setLoading(false);
      }
    };

    fetchServico();
  }, [authToken, id]);

  const handleSubmit = async () => {
    setError('');
    if (!dataInicio || !dataFim) {
      setError('⚠ Preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        servicoId: parseInt(id, 10),
        solicitanteId: userInfo.utilizadorId,
        dataInicio,
        dataFim,
        estadoId: 2,
        dataCriacao: new Date().toISOString().split('T')[0],
      };

      const resp = await fetch('http://localhost:5053/api/pedidoservico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error('Erro ao solicitar serviço');
      navigate('/MyServices');
    } catch (err) {
      console.error(err);
      setError('❌ Falha ao solicitar serviço.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="reqservice-loading">A carregar serviço...</p>;
  if (!servico) return <p className="reqservice-error">Serviço não encontrado.</p>;

  return (
    <div className="reqservice-container">
      <Header />
      <h1 className="reqservice-title">Solicitar Serviço</h1>

      <div className="reqservice-grid">
        <div className="reqservice-panel-header">
          <h2>{servico.nome}</h2>
          <p className="reqservice-tipo">{servico.tipoServico?.nome || '-'}</p>
        </div>

        <div className="reqservice-panel-desc">
          <h3>Descrição</h3>
          <p>{servico.descricao || 'Sem descrição.'}</p>
        </div>

        <div className="reqservice-panel-status">
          <h3>Estado</h3>
          <span className={`reqservice-status-label ${servico.disponibilidade ? 'available' : 'unavailable'}`}>
            {servico.disponibilidade ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
          </span>
        </div>

        <div className="reqservice-panel-price">
          <h3>Valor</h3>
          <p className="reqservice-price">{servico.preco}€</p>
        </div>

        <div className="reqservice-panel-created">
          <h3>Data de Criação</h3>
          <p>{new Date(servico.dataCriacao).toLocaleDateString()}</p>
        </div>

        <div className="reqservice-panel-community">
          <h3>Comunidade</h3>
          <p>{comunidadeNome || `ID ${servico.comunidadeId}`}</p>
        </div>

        <div className="reqservice-panel-provider">
          <h3>Prestador</h3>
          <p>{prestadorNome || `ID ${servico.prestadorId}`}</p>
        </div>

        <div className="reqservice-panel-form">
          {error && <div className="reqservice-error-message"><p>{error}</p></div>}

          <label>Data Início</label>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />

          <label>Data Fim</label>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>

        <div className="reqservice-panel-image">
          <img
            src={
              servico.imagemUrl
                ? servico.imagemUrl
                : `http://localhost:5053/images/servicos/servico${servico.servicoId}.jpg`
            }
            alt={`Imagem do serviço ${servico.nome}`}
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'http://localhost:5053/images/sem-foto.jpg';
            }}
          />
        </div>
      </div>

      <div className="reqservice-actions">
        <button className="reqservice-btn cancel" onClick={() => navigate(-1)} disabled={submitting}>
          Cancelar
        </button>
        <button className="reqservice-btn confirm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'A enviar...' : 'Concluir'}
        </button>
      </div>
    </div>
  );
}
