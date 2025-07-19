import React from 'react';

export default function FiltroModal({ children, onAplicar, onCancelar }) {
  return (
    <div className="filter-modal">
      <div className="filter-content">
        {children}
        <div className="filter-actions">
          <button onClick={onAplicar} className="btn confirm">Aplicar Filtro</button>
          <button onClick={onCancelar} className="btn cancel">Cancelar</button>
        </div>
      </div>
    </div>
  );
}