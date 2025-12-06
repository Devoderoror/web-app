# Super Sistemas - Sistema Web Simples

Um sistema web simples desenvolvido com **Node.js + Express** (JavaScript) e **HTML + Bootstrap**, com funcionalidades de autenticação e gerenciamento de três cadastros (Usuários, Clientes e Fornecedores).

## Requisitos Atendidos

- ✅ **Publicado na Web** - Pronto para deploy
- ✅ **Linguagem:** JavaScript (Node.js + Express)
- ✅ **Framework:** Express (leve e simples)
- ✅ **Banco de Dados:** Dados em memória (simples)
- ✅ **3 Cadastros CRUD:**
  - Usuários (incluir, editar, excluir, listar)
  - Clientes (incluir, editar, excluir, listar)
  - Fornecedores (incluir, editar, excluir, listar)
- ✅ **Autenticação:** Sistema de login

## Estrutura do Projeto

```
simple-web-app/
├── server.js              # Servidor Express com APIs
├── package.json           # Dependências do projeto
├── README.md              # Este arquivo
└── public/                # Arquivos HTML (Frontend)
    ├── index.html
    ├── login.html
    ├── principal.html
    ├── menu.html
    ├── rodape.html
    ├── usuario/
    │   ├── usuario_listar.html
    │   ├── usuario_incluir.html
    │   └── usuario_editar.html
    ├── cliente/
    │   ├── cliente_listar.html
    │   ├── cliente_incluir.html
    │   └── cliente_editar.html
    └── fornecedor/
        ├── fornecedor_listar.html
        ├── fornecedor_incluir.html
        └── fornecedor_editar.html
```

## Como Executar Localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

O servidor rodará em `http://localhost:3000`

### 3. Acessar o sistema
- Abra o navegador e acesse: `http://localhost:3000`
- Clique em "Ir para Login"
- Use as credenciais padrão:
  - **E-mail:** `joao@example.com`
  - **Senha:** `123`

## APIs Disponíveis

### Autenticação
- `POST /api/login` - Fazer login
- `POST /api/logout` - Fazer logout

### Usuários
- `GET /api/usuarios` - Listar todos os usuários
- `POST /api/usuarios` - Criar novo usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### Clientes
- `GET /api/clientes` - Listar todos os clientes
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Fornecedores
- `GET /api/fornecedores` - Listar todos os fornecedores
- `POST /api/fornecedores` - Criar novo fornecedor
- `PUT /api/fornecedores/:id` - Atualizar fornecedor
- `DELETE /api/fornecedores/:id` - Deletar fornecedor

## Explicação do Código

### server.js - Backend (Node.js + Express)

O arquivo `server.js` contém:

1. **Inicialização do Express:**
   ```javascript
   const app = express();
   app.use(express.json());
   app.use(express.static('public'));
   ```
   - Cria a aplicação Express
   - Habilita suporte a JSON
   - Serve arquivos estáticos da pasta `public`

2. **Dados em Memória:**
   ```javascript
   let usuarios = [...];
   let clientes = [...];
   let fornecedores = [...];
   ```
   - Armazena dados em arrays (simples, sem banco de dados)

3. **Rotas de Login:**
   ```javascript
   app.post('/api/login', (req, res) => {
     const usuario = usuarios.find(u => u.email === email && u.senha === senha);
     if (usuario) res.json({ sucesso: true, usuario });
   });
   ```
   - Valida credenciais do usuário
   - Retorna dados do usuário se válido

4. **CRUD de Usuários:**
   ```javascript
   app.get('/api/usuarios', (req, res) => res.json(usuarios));
   app.post('/api/usuarios', (req, res) => { /* criar */ });
   app.put('/api/usuarios/:id', (req, res) => { /* atualizar */ });
   app.delete('/api/usuarios/:id', (req, res) => { /* deletar */ });
   ```
   - Implementa as operações CRUD para usuários
   - Mesmo padrão para clientes e fornecedores

### Frontend - HTML + JavaScript

Cada página HTML:

1. **Carrega Menu e Rodapé:**
   ```javascript
   fetch('menu.html').then(r => r.text()).then(h => document.getElementById('menu').innerHTML = h);
   ```
   - Usa `fetch` para carregar componentes reutilizáveis

2. **Chamadas de API:**
   ```javascript
   const response = await fetch('/api/usuarios', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(dados)
   });
   ```
   - Faz requisições HTTP para o backend
   - Envia/recebe dados em JSON

3. **Manipulação do DOM:**
   ```javascript
   const tbody = document.getElementById('tabelaUsuarios');
   usuarios.forEach(u => {
     const tr = document.createElement('tr');
     tr.innerHTML = `<td>${u.nome}</td>...`;
     tbody.appendChild(tr);
   });
   ```
   - Cria elementos HTML dinamicamente
   - Popula tabelas com dados da API

## Funcionalidades

### Login
- Validação de e-mail e senha
- Armazenamento de usuário no localStorage
- Redirecionamento para página principal

### Cadastro de Usuários
- **Incluir:** Formulário para criar novo usuário
- **Listar:** Tabela com todos os usuários
- **Editar:** Formulário pré-preenchido para edição
- **Excluir:** Seleção múltipla com confirmação

### Cadastro de Clientes
- Mesmo padrão de usuários
- Campos: Nome, E-mail, Telefone

### Cadastro de Fornecedores
- Mesmo padrão de usuários e clientes
- Campos: Nome, E-mail, Telefone

## Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, Bootstrap 5, JavaScript vanilla
- **Comunicação:** REST API com JSON
- **Armazenamento:** Memória (arrays)

## Notas Importantes

- Os dados são armazenados em memória e serão perdidos ao reiniciar o servidor
- Para produção, seria necessário integrar um banco de dados (SQLite, PostgreSQL, etc.)
- O sistema usa localStorage para manter o usuário logado no navegador

## Próximos Passos para Melhorias

1. Integrar banco de dados SQLite ou PostgreSQL
2. Adicionar validações mais robustas
3. Implementar hash de senha
4. Adicionar testes automatizados
5. Melhorar tratamento de erros
6. Adicionar mais campos nos cadastros

## Autor

Desenvolvido para fins educacionais - Projeto APS/Avaliação

## Licença

MIT
