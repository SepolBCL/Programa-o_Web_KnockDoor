// Aqui futuramente você pode colocar suas funções de fetch/Axios
export const fetchData = async () => {
    // exemplo
    const response = await fetch('https://sua-api.com/endpoint');
    return await response.json();
  };
  