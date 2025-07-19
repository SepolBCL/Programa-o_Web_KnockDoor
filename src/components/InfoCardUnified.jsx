function InfoCardUnified({
    title,
    type,
    value,
    onMoreInfo,
    id,
    variant // 'recurso', 'grupo', 'servico'
}) {
    // Definições específicas por tipo
    const config = {
        recurso: {
            cardClass: 'info-card',
            contentClass: 'info-card-content',
            btnColor: '#002b5c',
            imgPath: `http://localhost:5053/images/recursos/recurso${id}.jpg`
        },
        grupo: {
            cardClass: 'info-card2',
            contentClass: 'info-card2-content',
            btnColor: '#365b99',
            imgPath: `http://localhost:5053/images/grupos/grupo${id || 'default'}.jpg`
        },
        servico: {
            cardClass: 'info-card3',
            contentClass: 'info-card3-content',
            btnColor: '#0074d9',
            imgPath: `http://localhost:5053/images/servicos/servico${id || 'default'}.jpg`
        }
    }[variant];

    return (
        <div className={config.cardClass}>
    <div className={config.contentClass}>
        <div className="info-text">
            <div className="info-title">{title}</div>
            {type && <div><strong>Tipo:</strong> {type}</div>}
            {value !== undefined && value !== 'N/A' && (
                <div><strong>Valor:</strong> {value}€</div>
            )}
            <button
                className="info-btn"
                style={{ backgroundColor: config.btnColor }}
                onClick={onMoreInfo}
            >
                ℹnfo
            </button>
        </div>

        {/* Linha vertical entre texto e imagem */}
        <div className="linha-vertical-info"></div>

        <div className="image-wrapper">
            <img
                src={config.imgPath}
                alt={`Imagem de ${title}`}
                onError={e => {
                    e.target.onerror = null;
                    e.target.src = 'http://localhost:5053/images/sem-foto.jpg';
                }}
                className="imagehome"
            />
        </div>
    </div>
</div>
    );
}

export default InfoCardUnified;