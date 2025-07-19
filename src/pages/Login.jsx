import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/App.css';
import BotaoAcao from '../components/BotaoAcao';


export default function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [comunidadesParaEscolher, setComunidadesParaEscolher] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [currentUser, setCurrentUser] = useState(null);
    const [currentToken, setCurrentToken] = useState(null);

    const [novaComunidade, setNovaComunidade] = useState({
        nome: '',
        descricao: '',
        endereco: '',
        estado: 'Ativo',
        codigoPostal: '',
        regraComunidadeId: 1,
    });

    const [postalInfo, setPostalInfo] = useState([]);
    const [showAssocModal, setShowAssocModal] = useState(false);
    const [comunidadesDisponiveis, setComunidadesDisponiveis] = useState([]);

    useEffect(() => {
        if (novaComunidade.codigoPostal.length >= 4) {
            fetch(`http://localhost:5053/api/CodigoPostal/search/${novaComunidade.codigoPostal}`)
                .then(res => res.json())
                .then(data => setPostalInfo(data.$values || []))
                .catch(() => setPostalInfo([]));
        } else {
            setPostalInfo([]);
        }
    }, [novaComunidade.codigoPostal]);

    const handleAbrirModalAssociar = async () => {
        try {
            const allResp = await fetch('http://localhost:5053/api/comunidade', {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            const allData = await allResp.json();
            const todas = allData['$values'];

            const assocResp = await fetch('http://localhost:5053/api/comunidadeutilizador', {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            const assocData = await assocResp.json();
            const associadas = assocData['$values']
                .filter((c) => c.utilizadorId === currentUser.utilizadorId)
                .map((c) => c.comunidadeId);

            const naoAssociadas = todas.filter(c => !associadas.includes(c.comunidadeId));
            setComunidadesDisponiveis(naoAssociadas);
            setShowAssocModal(true);
        } catch (error) {
            console.error('Erro ao obter comunidades:', error);
        }
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const authResponse = await fetch('http://localhost:5053/api/utilizador/autenticar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, Senha: senha }),
            });

            if (!authResponse.ok) {
                setErrorMessage('❌ Email ou senha inválidos.');
                setTimeout(() => setErrorMessage(''), 3000);
                return;
            }

            const authData = await authResponse.json();
            setCurrentToken(authData.token);

            const utilizadoresResp = await fetch('http://localhost:5053/api/utilizador', {
                headers: { Authorization: `Bearer ${authData.token}` },
            });
            const utilizadoresData = await utilizadoresResp.json();
            const utilizador = utilizadoresData['$values'].find((u) => u.email === email);

            if (!utilizador) {
                setErrorMessage('❌ Utilizador encontrado, mas não identificado corretamente.');
                setTimeout(() => setErrorMessage(''), 3000);
                return;
            }

            setCurrentUser(utilizador);

            const comunidadesUtilizadorResp = await fetch('http://localhost:5053/api/comunidadeutilizador', {
                headers: { Authorization: `Bearer ${authData.token}` },
            });
            const comunidadesUtilizadorData = await comunidadesUtilizadorResp.json();
            const comunidadesAtivas = comunidadesUtilizadorData['$values'].filter(
                (c) => c.utilizadorId === utilizador.utilizadorId && c.ativo === true
            );

            const todasComunidadesResp = await fetch('http://localhost:5053/api/comunidade', {
                headers: { Authorization: `Bearer ${authData.token}` },
            });
            const todasComunidadesData = await todasComunidadesResp.json();

            if (comunidadesAtivas.length === 0) {
                setMessage('Não possui comunidades ativas. Pesquise ou crie uma nova:');
                setComunidadesParaEscolher(todasComunidadesData['$values']);
                setShowPopup(true);
                return;
            }

            const comunidadesDetalhadas = comunidadesAtivas
                .map((c) => todasComunidadesData['$values'].find((com) => com.comunidadeId === c.comunidadeId))
                .filter((c) => c);

            if (comunidadesDetalhadas.length >= 1) {
                setMessage('Selecione a comunidade para aceder:');
                setComunidadesParaEscolher(comunidadesDetalhadas);
                setShowPopup(true);
                return;
            }

        } catch (error) {
            console.error('Erro durante o login:', error);
            setErrorMessage('❌ Erro ao autenticar. Verifique a ligação ou tente mais tarde.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleSelecionarComunidadeDireto = async (comunidade) => {
        try {
            // Verificar se já está associado
            const checkResp = await fetch(`http://localhost:5053/api/comunidadeutilizador`, {
                headers: { 'Authorization': `Bearer ${currentToken}` },
            });

            if (!checkResp.ok) {
                setMessage('Erro ao verificar associação à comunidade.');
                return;
            }

            const data = await checkResp.json();
            const existe = data['$values'].find((c) => c.comunidadeId === comunidade.comunidadeId && c.utilizadorId === currentUser.utilizadorId);

            if (!existe) {
                // Se não está associado, faz o POST
                const payload = {
                    comunidadeId: comunidade.comunidadeId,
                    utilizadorId: currentUser.utilizadorId,
                    ativo: true,
                    admin: false,
                    comunidade: null,
                };

                const resp = await fetch('http://localhost:5053/api/comunidadeutilizador', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                    body: JSON.stringify(payload),
                });

                if (!resp.ok) {
                    setMessage('Erro ao aderir à comunidade.');
                    return;
                }
            }

            // Faz sempre login no final
            login(currentUser, currentToken, comunidade);
            setShowPopup(false);
            navigate('/home');
        } catch (error) {
            console.error('Erro ao aderir/selecionar comunidade:', error);
            setMessage('Erro ao aderir/selecionar comunidade.');
        }
    };


    const handleCriarComunidade = async () => {
        try {
            const payload = {
                nome: novaComunidade.nome,
                descricao: novaComunidade.descricao,
                endereco: novaComunidade.endereco,
                estado: novaComunidade.estado,
                dataCriacao: new Date().toISOString().split('T')[0],
                regraComunidadeId: novaComunidade.regraComunidadeId,
                codigoPostal: novaComunidade.codigoPostal,
            };

            const resp = await fetch('http://localhost:5053/api/comunidade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                setMessage('Erro ao criar comunidade.');
                return;
            }

            const nova = await resp.json();

            const assocPayload = {
                comunidadeId: nova.comunidadeId,
                utilizadorId: currentUser.utilizadorId,
                ativo: true,
                admin: false,
                comunidade: null,
            };

            const assocResp = await fetch('http://localhost:5053/api/comunidadeutilizador', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify(assocPayload),
            });

            if (!assocResp.ok) {
                setMessage('Comunidade criada, mas erro ao associar utilizador.');
                return;
            }

            login(currentUser, currentToken, nova);
            setShowCreateForm(false);
            setShowPopup(false);
            navigate('/home');
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            setMessage('Erro ao criar comunidade ou associar utilizador.');
        }
    };

    const comunidadesFiltradas = comunidadesParaEscolher.filter((com) =>
        com.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="login-container">
            <div className="login-panel">
                <img src="/KD_Logo.png" className="logo2" alt="KnockDoor Logo" />
                <div className="CMV">Comunidade Entre Vizinhos</div>
                <h2 className="greeting">Olá!</h2>

                {errorMessage && (
                    <div style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}>
                        {errorMessage}
                    </div>
                )}

                <form className="login-form" onSubmit={handleLogin}>
                    <label>E-mail</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <label>Password</label>
                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                   


                    <div className="login-buttons">
                        <BotaoAcao
                            type="submit"
                            texto="Iniciar Sessão"
                            classe="login-form-btn"
                        />
                        <BotaoAcao
                            type="button"
                            texto="Sair"
                            onClick={() => navigate('/')}
                            classe="login-form-btn"
                        />

                    </div>
                 <BotaoAcao
                        texto="Recuperar Password"
                        onClick={() => navigate('/RecoverPassword')}
                        classe="btn-link"
                    />
                </form>
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        {!showCreateForm ? (
                            <>
                                <h3>{message}</h3>
                                <input type="text" placeholder="Pesquisar comunidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <ul>
                                    {comunidadesFiltradas.length > 0 ? (
                                        comunidadesFiltradas.map((com) => (
                                            <li key={com.comunidadeId} style={{ cursor: 'pointer' }} onClick={() => handleSelecionarComunidadeDireto(com)}>
                                                {com.nome}
                                            </li>
                                        ))
                                    ) : (
                                        <li style={{ color: '#999' }}>Nenhuma comunidade encontrada.</li>
                                    )}
                                </ul>
                                <div className="login-buttons">

                                    <BotaoAcao
                                        texto="Criar Comunidade"
                                        onClick={() => setShowCreateForm(true)}
                                        classe="login-form-btn"
                                    />
                                    <BotaoAcao
                                        texto="Associar Comunidade"
                                        onClick={handleAbrirModalAssociar}
                                        classe="login-form-btn"
                                    />
                                                                  
                                    <BotaoAcao
                                        texto="Sair"
                                        onClick={() => setShowPopup(false)}
                                        classe="login-form-btn"
                                    />
                            </div>            
                            </>
                        ) : (
                            <>
                                <h3>Criar Comunidade</h3>
                                <input type="text" placeholder="Nome" value={novaComunidade.nome} onChange={(e) => setNovaComunidade({ ...novaComunidade, nome: e.target.value })} />
                                <input type="text" placeholder="Descrição" value={novaComunidade.descricao} onChange={(e) => setNovaComunidade({ ...novaComunidade, descricao: e.target.value })} />
                                <input type="text" placeholder="Endereço" value={novaComunidade.endereco} onChange={(e) => setNovaComunidade({ ...novaComunidade, endereco: e.target.value })} />
                                <input type="text" placeholder="Código Postal" value={novaComunidade.codigoPostal} onChange={(e) => setNovaComunidade({ ...novaComunidade, codigoPostal: e.target.value })} />

                                {postalInfo.length > 0 && (
                                    <select onChange={(e) => setNovaComunidade({ ...novaComunidade, codigoPostal: e.target.value })} defaultValue="">
                                        <option value="" disabled>Selecione o código postal</option>
                                        {postalInfo.map((item) => (
                                            <option key={item.codigoPostal1} value={item.codigoPostal1}>
                                                {item.codigoPostal1} - {item.descricao}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <select value={novaComunidade.estado} onChange={(e) => setNovaComunidade({ ...novaComunidade, estado: e.target.value })}>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                                <select value={novaComunidade.regraComunidadeId} onChange={(e) => setNovaComunidade({ ...novaComunidade, regraComunidadeId: parseInt(e.target.value) })}>
                                    <option value={1}>Regra Padrão</option>
                                    <option value={2}>Regra Avançada</option>
                                </select>
                                <div className="login-buttons">

                                <BotaoAcao
                                    texto="Confirmar"
                                    onClick={handleCriarComunidade}
                                     classe="login-form-btn"
                                />
                                <BotaoAcao
                                    texto="Cancelar"
                                    onClick={() => setShowCreateForm(false)}
                                     classe="login-form-btn"
                                />
                                </div>

                            </>
                        )}
                    </div>
                </div>
            )}
            {showAssocModal && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>Selecione a comunidade para aderir:</h3>
                        <input
                            type="text"
                            placeholder="Pesquisar comunidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ul>
                            {comunidadesDisponiveis
                                .filter((com) => com.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((com) => (
                                    <li
                                        key={com.comunidadeId}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelecionarComunidadeDireto(com)}
                                    >
                                        {com.nome}
                                    </li>
                                ))}
                        </ul>
                        <BotaoAcao
                            texto="Cancelar"
                            onClick={() => setShowAssocModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
