import BotaoAcao from './BotaoAcao';
import ImagemComFallback from './ImagemComFallback';


const InfoCardGenerico = ({
  titulo,
  subtitulo,
  descricao,
  preco,
  status,
  imagemSrc,
  imagemClasse = 'imagehome2',
  textoAcao = 'Ver Mais',
  onAcao,
  badge,
  children
}) => {
  return (
    <div className="card">
      {/* Título com linha */}
      <div className="card-header">
        <span className="titulo">{titulo}</span>
      </div>

      {/* Conteúdo textual */}
      {subtitulo && <p className="resource-type">{subtitulo}</p>}
      {descricao && <p className="resource-description">{descricao}</p>}
      {preco !== undefined && (
        <p className="resource-rating">Preço: {preco}€</p>
      )}

      {children && <div className="extra-content">{children}</div>}

      {/* Disponível + Botão à esquerda, Imagem à direita */}
      <div className="bottom-row">
        <div className="status-e-botao">
          {status && (
            <span className={`status ${status.cor}`}>{status.texto}</span>
          )}
          {onAcao && (
            <BotaoAcao
              texto={textoAcao}
              onClick={onAcao}
              classe="more-info-btn"
            />
          )}
        </div>

        {imagemSrc && (
          <div className="image-wrapper">
            <ImagemComFallback
              src={imagemSrc}
              alt={`Imagem de ${titulo}`}
              className={imagemClasse}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCardGenerico;
