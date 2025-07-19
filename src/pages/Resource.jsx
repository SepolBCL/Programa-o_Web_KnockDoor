// Resource.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Resource.css';
import { AuthContext } from '../contexts/AuthContext';
import FilterModal from '../components/FilterModal';
import InfoCardGenerico from '../components/InfoCardGenerico';
import SearchBar from '../components/SearchBar';

export default function Resource() {
    const { authToken, userInfo, communityInfo } = useContext(AuthContext);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [recursos, setRecursos] = useState([]);
    const [tiposRecurso, setTiposRecurso] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authToken || !userInfo || !communityInfo) return;

        const fetchResources = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/recurso', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = await response.json();
                const todos = data?.$values || [];
                const filtrados = todos.filter(r => r.comunidadeId === communityInfo.comunidadeId);
                setRecursos(filtrados);
            } catch (error) {
                console.error('Erro ao obter recursos:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTiposRecurso = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/tiporecurso', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = await response.json();
                setTiposRecurso(data?.$values || []);
            } catch (error) {
                console.error('Erro ao obter tipos de recurso:', error);
            }
        };

        fetchResources();
        fetchTiposRecurso();
    }, [authToken, userInfo, communityInfo]);

    const recursosFiltrados = recursos.filter(recurso => {
        const matchesName = recurso.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = tipoFilter ? recurso.tipoRecursoId === parseInt(tipoFilter) : true;
        const isAvailable = recurso.disponibilidade;
        return matchesName && matchesTipo && isAvailable;
    });

    return (
        <div className="resource-container">
            <Header />

            <h1 className="main-title">Alugar Recursos</h1>
            <SearchBar
                placeholder="Pesquisar recursos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFilter={() => setShowFilter(true)}
            />

            {showFilter && (
                <FilterModal
                    onAplicar={() => setShowFilter(false)}
                    onCancelar={() => setShowFilter(false)}
                >
                    <label>
                        Tipo Recurso
                        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}>
                            <option value="">Todos</option>
                            {tiposRecurso.map((tipo) => (
                                <option key={tipo.tipoRecursoId} value={tipo.tipoRecursoId}>
                                    {tipo.nome}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Data Início
                        <input
                            type="date"
                            value={dataInicio}
                            onChange={e => setDataInicio(e.target.value)}
                        />
                    </label>
                    <label>
                        Data Fim
                        <input
                            type="date"
                            value={dataFim}
                            onChange={e => setDataFim(e.target.value)}
                        />
                    </label>
                </FilterModal>
            )}

            {loading ? (
                <p>A carregar recursos...</p>
            ) : (
                <div className="resources-grid">
                    {recursosFiltrados.length > 0 ? (
                        recursosFiltrados.map(recurso => (
                            <InfoCardGenerico
                                key={recurso.recursoId}
                                titulo={recurso.nome}
                                subtitulo={recurso.descricao}
                                preco={recurso.preco}
                                status={{
                                    texto: recurso.disponibilidade ? 'DISPONÍVEL' : 'INDISPONÍVEL',
                                    cor: recurso.disponibilidade ? 'green' : 'gray'
                                }}
                                imagemSrc={`http://localhost:5053/images/recursos/recurso${recurso.recursoId}.jpg`}
                                textoAcao="Alugar" classe="more-info-btn" cor=" #002b5c"
                                onAcao={() => navigate(`/RentResource/${recurso.recursoId}`)}
                            >
                                <p className="resource-rating">Tempo mínimo de reserva: <span>{recurso.tempoMinimoReserva} horas</span></p>
                            </InfoCardGenerico>
                        ))
                    ) : (
                        <p>Nenhum recurso encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
} 

