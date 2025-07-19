// src/pages/RentResource.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/RentResource.css';
import { AuthContext } from '../contexts/AuthContext';

export default function RentResource() {
    const { authToken, userInfo } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [recurso, setRecurso] = useState(null);
    const [tipoRecursoNome, setTipoRecursoNome] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authToken) return;

        const fetchRecurso = async () => {
            try {
                const resp = await fetch(`http://localhost:5053/api/recurso/${id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (!resp.ok) throw new Error('Erro ao carregar recurso');
                const data = await resp.json();
                if (!data) throw new Error('Recurso não encontrado');
                setRecurso(data);

                if (data.tipoRecursoId) {
                    const tipoResp = await fetch(
                        `http://localhost:5053/api/tiporecurso/${data.tipoRecursoId}`,
                        { headers: { Authorization: `Bearer ${authToken}` } }
                    );
                    if (tipoResp.ok) {
                        const tipoData = await tipoResp.json();
                        setTipoRecursoNome(tipoData.nome);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err.message || 'Não foi possível carregar o recurso.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecurso();
    }, [authToken, id]);

    const handleSubmit = async () => {
        setError('');

        if (!dataInicio || !dataFim) {
            setError('⚠ Por favor, preencha as datas de início e fim.');
            return;
        }
        if (!userInfo) {
            setError('⚠ Informação do utilizador não disponível.');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                recursoId: parseInt(id, 10),
                utilizadorId: userInfo.utilizadorId,
                dataInicio,
                dataFim,
                dataCriacao: new Date().toISOString().split('T')[0]
            };

            const resp = await fetch('http://localhost:5053/api/recursoreserva', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) throw new Error('Erro ao alugar recurso');
            navigate('/MyRentals');
        } catch (err) {
            console.error(err);
            setError('❌ Falha ao concluir aluguer.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="loading">A carregar recurso...</p>;
    if (!recurso) return <p className="error">Recurso não encontrado.</p>;

    return (
        <div className="rent-container">
            <Header />
            <h1 className="rent-title">Alugar Recurso</h1>

            {/* GRID DE DETALHES */}
            <div className="rent-details">
                <div className="panel header-panel">
                    <h2>{recurso.nome}</h2>
                    <p className="tipo">{tipoRecursoNome || '-'}</p>
                </div>

                <div className="panel status-panel">
                    <h3>Estado</h3>
                    <span className={`status-label ${recurso.disponibilidade ? 'available' : 'unavailable'}`}>
                        {recurso.disponibilidade ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
                    </span>
                </div>

                <div className="panel price-panel">
                    <h3>Valor</h3>
                    <p className="price">{recurso.valorHora ?? recurso.preco}€ / h</p>
                </div>

                <div className="panel desc-panel">
                    <h3>Descrição</h3>
                    <p>{recurso.descricao || 'Sem descrição.'}</p>
                </div>

                <div className="panel duration-panel">
                    <h3>Tempo Mínimo</h3>
                    <p>{recurso.tempoMinimoReserva ?? '-'} h</p>
                    <h3>Tempo Máximo</h3>
                    <p>{recurso.tempoMaximoReserva ?? '-'} h</p>
                </div>

                <div className="panel form-panel">
                    {error && <div className="error-message"><p>{error}</p></div>}
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
                </div>

                <div className="panel image-panel">
                    <img
                        src={
                            recurso.imagemUrl
                                ? recurso.imagemUrl
                                : `http://localhost:5053/images/recursos/recurso${recurso.recursoId}.jpg`
                        }
                        alt={`Imagem de ${recurso.nome}`}
                        onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'http://localhost:5053/images/sem-foto.jpg';
                        }}
                    />
                </div>
            </div>
            <div className="rent-actions">
                <button
                    className="btn05 cancel"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                >
                    Cancelar
                </button>
                <button
                    className="btn05 confirm"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'A alugar...' : 'Concluir'}
                </button>
            </div>
        </div>
    );
}
