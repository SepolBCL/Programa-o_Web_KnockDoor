import React, { useEffect, useState, useContext } from 'react';
import Header from '../components/Header';
import '../styles/Community.css';
import { AuthContext } from '../contexts/AuthContext';
import SearchBar from '../components/SearchBar';
import BotaoAcao from '../components/BotaoAcao';

export default function Comunidades() {
  const { authToken } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [comunidades, setComunidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;

    const fetchComunidades = async () => {
      try {
        const response = await fetch('http://localhost:5053/api/comunidade', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) throw new Error('Erro ao obter comunidades');
        const data = await response.json();
        if (data?.$values && Array.isArray(data.$values)) {
          setComunidades(data.$values);
        } else {
          console.error('Resposta inesperada:', data);
        }
      } catch (error) {
        console.error('Erro ao obter comunidades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComunidades();
  }, [authToken]);

  const comunidadesFiltrados = comunidades.filter((comunidade) =>
    comunidade.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="comunidades-container">
        <h1 className="main-title">Comunidades</h1>

        <SearchBar
          placeholder="Pesquisar comunidades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFilter={() => { }} // sem funcionalidade de filtro nesta página
        />

        {loading ? (
          <p>A carregar comunidades...</p>
        ) : (
          <div className="resources-grid">
            {comunidadesFiltrados.length > 0 ? (
              comunidadesFiltrados.map((comunidade) => (
                <div className="card" key={comunidade.comunidadeId}>
                  <div className="card-header">
                    <span>{comunidade.nome}</span>
                    <span className="status green">{comunidade.estado}</span>
                  </div>
                  <p className="resource-type">Endereço: {comunidade.endereco}</p>
                  <p className="resource-type">Código Postal: {comunidades.codigoPostal}</p>
                  <p className="resource-rating">Criado em: {new Date(comunidade .dataCriacao).toLocaleDateString()}</p>
                 
                      <BotaoAcao
                          texto="Mais Info"
                          classe="more-info-btn"
                      />
                </div>
              ))
            ) : (
              <p>Nenhuma comunidade encontrada.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
