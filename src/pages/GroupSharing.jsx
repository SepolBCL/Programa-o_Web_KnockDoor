import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Resource.css';
import { AuthContext } from '../contexts/AuthContext';
import FilterModal from '../components/FilterModal';
import InfoCardGenerico from '../components/InfoCardGenerico';
import SearchBar from '../components/SearchBar';

export default function GroupSharing() {
    const { authToken } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('2');
    const [showFilter, setShowFilter] = useState(false);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authToken) {
            setError('Autenticação necessária');
            return;
        }

        const fetchGrupos = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5053/api/grupopartilha', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);

                const data = await response.json();
                setGrupos(data?.$values || []);
                setError(null);
            } catch (error) {
                console.error('Erro ao obter grupos:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGrupos();
    }, [authToken]);

    const gruposFiltrados = grupos.filter(grupo => {
        const matchesName = grupo.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = estadoFilter
            ? estadoFilter === '2'
                ? grupo.estadoId === 2
                : grupo.estadoId !== 2
            : true;
        return matchesName && matchesEstado;
    });

    const handleMoreInfo = (grupoId) => {
        if (!grupoId) {
            console.error('ID do grupo inválido:', grupoId);
            return;
        }
        navigate(`/RentGroupSharing/${grupoId}`);
    };

    return (
        <main className="resource-container">
            <Header />
            <h1 className="main-title">Grupos de Partilha</h1>

            <SearchBar
                placeholder="Pesquisar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFilter={() => setShowFilter(true)}
            />

            {showFilter && (
                <FilterModal
                    onAplicar={() => setShowFilter(false)}
                    onCancelar={() => {
                        setEstadoFilter('');
                        setShowFilter(false);
                    }}
                >
                    <label>
                        Estado do Grupo
                        <select
                            value={estadoFilter}
                            onChange={e => setEstadoFilter(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="2">Ativo</option>
                            <option value="1">Inativo</option>
                        </select>
                    </label>
                </FilterModal>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    {!authToken && <button onClick={() => navigate('/login')}> Ir para Login </button>}
                </div>
            )}

            {loading ? (
                <p>A carregar grupos...</p>
            ) : (
                <div className="resources-grid">
                    {gruposFiltrados.length > 0 ? (
                        gruposFiltrados.map((grupo) => (
                            <InfoCardGenerico
                                key={grupo.grupoId}
                                titulo={grupo.nome}
                                subtitulo={grupo.descricao}
                                status={{
                                    texto: grupo.estadoId === 2 ? 'Ativo' : 'Inativo',
                                    cor: grupo.estadoId === 2 ? 'green' : 'yellow',
                                }}
                                imagemSrc={`http://localhost:5053/images/grupos/grupo${grupo.grupoId || 'default'}.jpg`}
                                textoAcao="Aderir"
                                onAcao={() => handleMoreInfo(grupo.grupoId)}
                            >
                                <p className="resource-rating">
                                    Criado em <span>{new Date(grupo.dataCriacao).toLocaleDateString()}</span>
                                </p>
                            </InfoCardGenerico>
                        ))
                    ) : (
                        <p>Nenhum grupo encontrado.</p>
                    )}
                </div>
            )}
        </main>
    );
}
