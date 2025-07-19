import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import '../styles/Services.css';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FilterModal from '../components/FilterModal';
import InfoCardGenerico from '../components/InfoCardGenerico';
import SearchBar from '../components/SearchBar';

export default function Services() {
    const { authToken } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [servicos, setServicos] = useState([]);
    const [tiposServico, setTiposServico] = useState([]);
    const [tipoFilter, setTipoFilter] = useState('');
    const [dataServico, setDataServico] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authToken) return;

        const fetchServicos = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/servico', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await response.json();
                setServicos(data.$values || []);
            } catch (error) {
                console.error('Erro ao obter serviços:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTipos = async () => {
            try {
                const response = await fetch('http://localhost:5053/api/tiposervico', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await response.json();
                setTiposServico(data.$values || []);
            } catch (error) {
                console.error('Erro ao obter tipos de serviço:', error);
            }
        };

        fetchServicos();
        fetchTipos();
    }, [authToken]);

    const servicosFiltrados = servicos.filter(servico => {
        const matchesNome = servico.nome?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = tipoFilter ? servico.tipoServicoId === parseInt(tipoFilter) : true;
        const matchesData = dataServico ? servico.dataCriacao?.startsWith(dataServico) : true;
        return matchesNome && matchesTipo && matchesData && servico.disponibilidade;
    });

    return (
        <main className="resource-container">
            <Header />
            <h1 className="main-title">Serviços Disponíveis</h1>

            <SearchBar
                placeholder="Pesquisar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFilter={() => setShowFilter(true)}
            />

            {showFilter && (
                <FilterModal
                    onAplicar={() => setShowFilter(false)}
                    onCancelar={() => {
                        setTipoFilter('');
                        setDataServico('');
                        setShowFilter(false);
                    }}
                >
                    <label>
                        Tipo de Serviço
                        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}>
                            <option value="">Todos</option>
                            {tiposServico.map((tipo) => (
                                <option key={tipo.tipoServicoId} value={tipo.tipoServicoId}>
                                    {tipo.nome}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Data de Serviço
                        <input
                            type="date"
                            value={dataServico}
                            onChange={e => setDataServico(e.target.value)}
                        />
                    </label>
                </FilterModal>
            )}

            {loading ? (
                <p>A carregar serviços...</p>
            ) : (
                <div className="resources-grid">
                    {servicosFiltrados.length > 0 ? (
                        servicosFiltrados.map((servico) => (
                            <InfoCardGenerico
                                key={servico.servicoId}
                                titulo={servico.nome}
                                subtitulo={servico.tipoServico?.nome || 'Serviço'}
                                descricao={servico.descricao}
                                preco={servico.preco}
                                status={{
                                    texto: servico.disponibilidade ? 'DISPONÍVEL' : 'INDISPONÍVEL',
                                    cor: servico.disponibilidade ? 'green' : 'gray'
                                }}
                                imagemSrc={`http://localhost:5053/images/servicos/servico${servico.servicoId}.jpg`}
                                textoAcao="Solicitar"
                                onAcao={() => navigate(`/RequestService/${servico.servicoId}`)}
                            />
                        ))
                    ) : (
                        <p>Nenhum serviço encontrado.</p>
                    )}
                </div>
            )}
        </main>
    );
}
