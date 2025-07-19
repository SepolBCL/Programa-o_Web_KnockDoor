import React, { useState } from 'react';

export default function AvaliacaoModal({
  tipo,
  id,
  authToken,
  onClose,
  onSuccess,
  pontuacaoInicial = 0,
  comentarioInicial = ''
}) {
  const [pontuacao, setPontuacao] = useState(pontuacaoInicial);
  const [comentario, setComentario] = useState(comentarioInicial);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint =
      tipo === 'recurso'
        ? `http://localhost:5053/api/recursoreserva/avaliar/${id}`
        : `http://localhost:5053/api/pedidoservico/avaliacao/${id}`;

    const payload = {
      pontuacao: Number(pontuacao),
      comentario: comentario.trim()
    };

    try {
      const resp = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();

      if (!resp.ok) {
        setError(`❌ ${text}`);
        return;
      }

      setSuccess('✅ Avaliação registada com sucesso!');
      onSuccess?.(payload.pontuacao, payload.comentario);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError('❌ Erro ao enviar avaliação.');
    }
  };

  const maxScore = tipo === 'recurso' ? 5 : 5;

  return (
    <div className="popup-overlay">
      <div className="popup-content2">
        <h2>Avaliar {tipo === 'recurso' ? 'Recurso' : 'Serviço'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Pontuação (0 a {maxScore})</label>
          <input
            type="number"
            min="0"
            max={maxScore}
            value={pontuacao}
            onChange={(e) => setPontuacao(e.target.value)}
            required
          />
          <label>Comentário (máx. 500 caracteres)</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="btn confirm">Submeter Avaliação</button>
            <button type="button" className="btn cancel" onClick={onClose}>Cancelar</button>
          </div>

        </form>
        {error && <p className="error-alert">{error}</p>}
        {success && <p className="success-alert">{success}</p>}
      </div>
    </div>
  );
}
