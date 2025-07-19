import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/MyResource.css';
import { AuthContext } from '../contexts/AuthContext';
import AvaliationModal from '../components/AvaliationModal';
import InfoCardGenerico from '../components/InfoCardGenerico';

export default function MyRentals() {
  const { authToken, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recursosAlugados, setRecursosAlugados] = useState([]);
  const [tipoRecursoNomes, setTipoRecursoNomes] = useState({});
  const [selectedRecurso, setSelectedRecurso] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [notificacoesPendentes] = useState(0);

  useEffect(() => {
    if (!authToken || !userInfo) return;

    const fetchData = async () => {
      try {
        const reservasResponse = await fetch('http://localhost:5053/api/recursoreserva', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const reservasData = await reservasResponse.json();
        const reservas = reservasData['$values'];

        const minhasReservas = reservas.filter(
          (reserva) => reserva.utilizadorId === userInfo.utilizadorId && reserva.recurso
        );

        const alugados = minhasReservas.map((reserva) => ({
          ...reserva.recurso,
          reservaInfo: reserva,
        }));

        setRecursosAlugados(alugados);

        const tiposResponse = await fetch('http://localhost:5053/api/tiporecurso', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const tiposData = await tiposResponse.json();
        const tipos = tiposData['$values'];

        const nomesPorId = {};
        tipos.forEach((t) => {
          nomesPorId[t.tipoRecursoId] = t.nome;
        });
        setTipoRecursoNomes(nomesPorId);
      } catch (error) {
        console.error('Erro ao carregar alugueres:', error);
      }
    };

    fetchData();
  }, [authToken, userInfo]);

  const abrirModalAvaliacao = (recurso) => {
    setSelectedRecurso(recurso);
    setShowModal(true);
    setShowDetalhes(false);
  };

  const abrirDetalhes = (recurso) => {
    setSelectedRecurso(recurso);
    setShowDetalhes(true);
    setShowModal(false);
  };

  const fecharPopup = () => {
    setSelectedRecurso(null);
    setShowModal(false);
    setShowDetalhes(false);
  };

  const atualizarAvaliacaoLocal = (id, novaPontuacao, novoComentario) => {
    setRecursosAlugados(prev =>
      prev.map((r) =>
        r.reservaInfo.reservaId === id
          ? {
              ...r,
              reservaInfo: {
                ...r.reservaInfo,
                pontuacao: novaPontuacao,
                comentario: novoComentario,
              },
            }
          : r
      )
    );
  };

  return (
    <div className="my-resources-container">
      <Header />
      <h1 className="main-title">Meus Recursos</h1>

      <div className="MyResources-buttons">
              <button className="MyResources-buttons_btn inactive"
                  onClick={() => navigate('/myresource')}>
          Meus Anúncios
        </button>
              <button className="MyResources-buttons_btn active"
                  onClick={() => navigate('/MyRentals')}>
          Meus Alugueres
        </button>
              <button className="MyResources-buttons_btn inactive"
                  onClick={() => navigate('/pendingActions')}>
          Ações Pendentes  {notificacoesPendentes > 0 && (
            <span className="badge">{notificacoesPendentes}</span>
          )} 
        </button>
      </div>

      <div className="resources-grid">
        {recursosAlugados.length === 0 && <p>Não tens alugueres registados.</p>}
        {recursosAlugados.map((recurso) => {
          const podeAvaliar = recurso.reservaInfo.liquidado && recurso.reservaInfo.recursoDevolvido;

          return (
            <InfoCardGenerico
              key={`${recurso.recursoId}-${recurso.reservaInfo.reservaId}`}
              titulo={recurso.nome}
              subtitulo={`Tipo: ${tipoRecursoNomes[recurso.tipoRecursoId] || `ID ${recurso.tipoRecursoId}`}`}
              status={!podeAvaliar ? { texto: 'AÇÕES PENDENTES', cor: 'orange' } : null}
              imagemSrc={`http://localhost:5053/images/recursos/recurso${recurso.recursoId}.jpg`}
              textoAcao={podeAvaliar ? 'Avaliar' : 'Mais Info'}
              onAcao={() => podeAvaliar ? abrirModalAvaliacao(recurso) : abrirDetalhes(recurso)}
            >
              <p className="resource-rating">
                Avaliações: <span>{recurso.reservaInfo.pontuacao > 0 ? recurso.reservaInfo.pontuacao + ' ★' : 'Sem avaliações'}</span>
              </p>
              {recurso.reservaInfo.comentario && (
                <p className="resource-comment">
                  <strong>Comentário:</strong> <i>{recurso.reservaInfo.comentario}</i>
                </p>
              )}
              <p className="resource-dates">
                De: {new Date(recurso.reservaInfo.dataInicio).toLocaleDateString()} <br />
                Até: {new Date(recurso.reservaInfo.dataFim).toLocaleDateString()}
              </p>
            </InfoCardGenerico>
          );
        })}
      </div>

      {showModal && selectedRecurso && (
        <AvaliationModal
          tipo="recurso"
          id={selectedRecurso.reservaInfo.reservaId}
          authToken={authToken}
          onClose={fecharPopup}
          pontuacaoInicial={selectedRecurso.reservaInfo.pontuacao}
          comentarioInicial={selectedRecurso.reservaInfo.comentario}
          onSuccess={(pontuacao, comentario) => {
            atualizarAvaliacaoLocal(selectedRecurso.reservaInfo.reservaId, pontuacao, comentario);
            fecharPopup();
          }}
        />
      )}

      {showDetalhes && selectedRecurso && (
        <div className="popup-overlay">
          <div className="popup-content2">
            <h2>{selectedRecurso.nome}</h2>
            <p><strong>Tipo:</strong> {tipoRecursoNomes[selectedRecurso.tipoRecursoId] || `ID ${selectedRecurso.tipoRecursoId}`}</p>
            <p><strong>Preço:</strong> {selectedRecurso.preco || selectedRecurso.valorHora}€</p>
            <p><strong>Descrição:</strong> {selectedRecurso.descricao || 'Sem descrição.'}</p>
            <p><strong>Comentário:</strong> {selectedRecurso.reservaInfo.comentario || 'Sem comentário.'}</p>
            <button onClick={fecharPopup} className="btn00">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
