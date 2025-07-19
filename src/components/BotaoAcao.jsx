import React from 'react';


const BotaoAcao = ({ texto, onClick, classe , type  }) => {

    return (
        <button
            type={type}
            className={classe}
            onClick={onClick}>
            {texto}
        </button>
    );
};

export default BotaoAcao;
