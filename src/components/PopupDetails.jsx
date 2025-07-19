import React from 'react';

export default function PopupDetalhes({ titulo, children, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content2">
        <h2>{titulo}</h2>
        {children}
        <button onClick={onClose} className="btn00">Fechar</button>
      </div>
    </div>
  );
}
