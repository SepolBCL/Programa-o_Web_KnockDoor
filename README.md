KnockDoor 🚪
O KnockDoor é uma plataforma web orientada para a partilha comunitária e economia colaborativa. A aplicação permite aos utilizadores partilhar recursos (objetos/equipamentos), oferecer ou requisitar serviços e criar ou juntar-se a grupos e comunidades locais.

O objetivo principal é fomentar a entreajuda e simplificar a gestão de empréstimos, alugueres e prestação de serviços entre membros de uma comunidade.

✨ Funcionalidades Principais
A plataforma está dividida em três eixos principais de partilha e interação:

📦 Gestão de Recursos:

Adicionar, visualizar e gerir recursos disponíveis (AddResource, Resource, MyResource).

Sistema de requisição e aluguer de recursos de outros utilizadores (RentResource, MyRentals).

🛠️ Serviços:

Oferta e pesquisa de serviços na comunidade (Services, AddService, MyServices).

Sistema de requisição de serviços e gestão de pedidos (RequestService, RequestedServices).

🤝 Comunidades e Grupos de Partilha:

Criação e adesão a grupos de partilha específicos (GroupSharing, AddGroupSharing, Community).

Aprovação de novos membros e gestão de acessos aos grupos (AprovalMember).

👤 Gestão de Utilizadores e Autenticação:

Registo e Login de utilizadores (Login, RegisterModal).

Recuperação e redefinição de palavra-passe (RecoverPassword, ResetPassword).

Configuração de perfil de utilizador (UserConfig).

Gestão de ações pendentes (aprovações de pedidos de recursos ou serviços) (PendingActions, PendingActionsServices).

🛠️ Tecnologias Utilizadas
O projeto foi desenvolvido com foco no ecossistema JavaScript moderno para o Frontend:

React.js: Biblioteca principal para a construção da interface de utilizador (UI).

JSX e CSS3: Para a estruturação e estilização das páginas e componentes (ex: AddResource.css, App.css).

React Context API: Utilizado para a gestão global do estado de autenticação da aplicação (AuthContext.js).

Node.js & NPM: Para a gestão de pacotes e execução do ambiente de desenvolvimento.

Integração API REST: Comunicação assíncrona com o backend através de serviços configurados (api.js, resourceService.js).

📁 Estrutura do Projeto
A arquitetura do código fonte (dentro da pasta src/) está organizada da seguinte forma:

/components: Componentes reutilizáveis da interface (ex: Header.jsx, SearchBar.jsx, FilterModal.jsx, InfoCardGenerico.jsx).

/pages: Componentes que representam as páginas inteiras da aplicação (ex: Home.jsx, Login.jsx, Community.jsx).

/contexts: Gestão de estados globais, como sessões de utilizadores (AuthContext.js).

/services: Ficheiros responsáveis pelas chamadas HTTP à API do backend e lógica de negócio de rede (api.js, handleLogout.js).

/styles: Folhas de estilo CSS organizadas por componente ou página.

/public & /wwwroot: Ficheiros estáticos e imagens dos recursos/serviços (KD_logo.png, diretórios de imagens grupos/, recursos/, servicos/).

🚀 Como Executar o Projeto Localmente
Para correres este projeto na tua máquina, vais precisar de ter o Node.js instalado.

Clonar o repositório (se aplicável):

Bash
git clone [URL_DO_REPOSITORIO]
cd KnockDoor
Instalar as dependências:
Na raiz do projeto (onde se encontra o package.json), executa:

Bash
npm install
Iniciar o servidor de desenvolvimento:

Bash
npm start
A aplicação deverá abrir automaticamente no browser no endereço http://localhost:3000.

Gerar a build de produção:
Para compilar a aplicação para produção, otimizada para melhor performance:

Bash
npm run build
Os ficheiros compilados ficarão disponíveis na pasta build/.

Projeto desenvolvido no âmbito da Unidade Curricular de Programação Web.
