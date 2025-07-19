import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterModal from './RegisterModal';
import '../styles/App.css';
import BotaoAcao from '../components/BotaoAcao';

const Home = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);

    return (
        <div className="home-container01">
            {/* Logo acima das caixas de texto */}
            <img src="/Kd_logo.png" className='logo1' alt="KnockDoor Logo" />

            <h1 className="titulo-comunidade">
                <div className="text-align_center">Comunidade Entre Vizinhos</div>
            </h1>

            <div className="cards01">
                <div className="card01 card1">
                    Agora já podes
                    <div className="text-align_center"><strong>partilhar</strong></div>
                    com os teus vizinhos aquela
                    <div className="text-align_right"><strong>máquina</strong></div>
                    que até <strong>não usas</strong>
                    <div className="text-align_right">há muito tempo…</div>
                </div>
                <div className="card01 card2">
                    Percebes muito de
                    <div className="text-align_right"><strong>matemática</strong></div>
                    disponibiliza-te para
                    <div className="text-align_center"><strong>prestar serviço</strong></div>
                    à tua <strong>comunidade</strong>
                </div>
                <div className="card01 card3">
                    Não consegues
                    <div className="text-align_center"><strong>comprar</strong></div>
                    aquela conta de
                    <div className="text-align_right"><strong>NETFLIX FULL HD</strong></div>
                    junta-te a uns vizinhos para veres em
                    <div className="text-align_right"><strong>grupo.</strong></div>
                </div>
            </div>

            <div className="actions00">
                <BotaoAcao
                    texto="Sobre Nós"
                    onClick={() => setShowPopup(true)}
                    classe="btn00 btn00-about"
                />
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-content2">
                            <h2>
                                <br />Techfive<br />
                                Soluções digitais sob medida para impulsionar negócios.
                                <br />Inovação, agilidade e tecnologia que conecta ideias a resultados.
                            </h2>
                            <BotaoAcao
                                texto="Fechar"
                                onClick={() => setShowPopup(false)}
                                classe="btn00"
                            />

                        </div>
                    </div>
                )}
                <BotaoAcao
                    texto="Entrar"
                    onClick={() => navigate('/login')}
                    classe="btn00 btn00-login"
                />
                <BotaoAcao
                    texto="Criar Conta"
                    onClick={() => setShowModal(true)}
                    classe="btn00 btn00-register"
                />
            </div>

            {showModal && <RegisterModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default Home;