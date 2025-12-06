# 📖 Explicação do Código - Super Sistemas

## 🎯 Visão Geral

O projeto **Super Sistemas** é uma aplicação web simples com:
- **Backend:** Node.js + Express (servidor)
- **Frontend:** HTML + Bootstrap + JavaScript (interface)
- **Dados:** Armazenados em memória (arrays)

---

## 🔧 BACKEND - server.js

### 1️⃣ Inicialização do Servidor

```javascript
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
```

**O que faz:**
- Importa Express (framework web)
- Importa CORS (permite requisições de diferentes origens)
- Cria a aplicação
- Habilita suporte a JSON
- Serve arquivos HTML da pasta `public`

---

### 2️⃣ Dados em Memória

```javascript
let usuarios = [
  { id: 1, nome: 'João Silva', email: 'joao@example.com', login: 'joao', senha: '123', perfil: 'Administrador' },
  { id: 2, nome: 'Maria Oliveira', email: 'maria@example.com', login: 'maria', senha: '123', perfil: 'Usuário' }
];

let clientes = [
  { id: 1, nome: 'Cliente A', email: 'clientea@example.com', telefone: '1234567890' }
];

let fornecedores = [
  { id: 1, nome: 'Fornecedor X', email: 'fornecedor@example.com', telefone: '1111111111' }
];
```

**O que faz:**
- Armazena dados em arrays (listas)
- Cada item tem um `id` único
- Dados são perdidos ao reiniciar o servidor

---

### 3️⃣ API de LOGIN

```javascript
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (usuario) {
    usuarioLogado = usuario;
    res.json({ sucesso: true, usuario });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
  }
});
```

**O que faz:**
- Recebe `email` e `senha` do formulário
- Procura um usuário com essas credenciais
- Se encontrar: retorna `{ sucesso: true, usuario }`
- Se não encontrar: retorna erro 401

**Exemplo de uso:**
```javascript
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'joao@example.com', senha: '123' })
});
```

---

### 4️⃣ CRUD - Listar (GET)

```javascript
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});
```

**O que faz:**
- Retorna todos os usuários em formato JSON
- Usado para popular a tabela na página

**Resposta:**
```json
[
  { id: 1, nome: 'João Silva', email: 'joao@example.com', ... },
  { id: 2, nome: 'Maria Oliveira', email: 'maria@example.com', ... }
]
```

---

### 5️⃣ CRUD - Criar (POST)

```javascript
app.post('/api/usuarios', (req, res) => {
  const { nome, email, login, senha, perfil } = req.body;
  const novoUsuario = {
    id: Math.max(...usuarios.map(u => u.id), 0) + 1,
    nome, email, login, senha, perfil
  };
  usuarios.push(novoUsuario);
  res.json({ sucesso: true, usuario: novoUsuario });
});
```

**O que faz:**
- Recebe dados do formulário
- Gera um novo `id` (maior id + 1)
- Adiciona o novo usuário ao array
- Retorna o usuário criado

**Exemplo:**
```javascript
fetch('/api/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: 'Pedro', email: 'pedro@example.com', ... })
});
```

---

### 6️⃣ CRUD - Atualizar (PUT)

```javascript
app.put('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
  if (usuario) {
    Object.assign(usuario, req.body);
    res.json({ sucesso: true, usuario });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
  }
});
```

**O que faz:**
- Recebe o `id` na URL (ex: `/api/usuarios/1`)
- Encontra o usuário com esse id
- Atualiza os dados com `Object.assign()`
- Retorna o usuário atualizado

---

### 7️⃣ CRUD - Deletar (DELETE)

```javascript
app.delete('/api/usuarios/:id', (req, res) => {
  const index = usuarios.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    usuarios.splice(index, 1);
    res.json({ sucesso: true });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
  }
});
```

**O que faz:**
- Encontra a posição do usuário no array
- Remove usando `splice()`
- Retorna sucesso ou erro

---

## 🎨 FRONTEND - HTML + JavaScript

### 1️⃣ Estrutura Básica (index.html)

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Super Sistemas</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div id="menu"></div>
  <main id="principal"></main>
  <div id="rodape"></div>
  
  <script>
    fetch('/menu.html').then(r => r.text()).then(h => document.getElementById('menu').innerHTML = h);
  </script>
</body>
</html>
```

**O que faz:**
- Define estrutura HTML básica
- Importa Bootstrap (CSS pronto)
- Carrega menu dinamicamente com `fetch()`

---

### 2️⃣ Carregamento Dinâmico (Fetch)

```javascript
fetch('/menu.html')
  .then(r => r.text())
  .then(h => document.getElementById('menu').innerHTML = h);
```

**Passo a passo:**
1. `fetch('/menu.html')` - Faz requisição HTTP
2. `.then(r => r.text())` - Converte resposta em texto
3. `.then(h => ...)` - Insere HTML no elemento com id `menu`

**Resultado:** Menu carregado em todas as páginas sem duplicação

---

### 3️⃣ Formulário de Login (login.html)

```html
<form id="loginForm">
  <input type="email" id="email" required>
  <input type="password" id="senha" required>
  <button type="submit">Entrar</button>
</form>

<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    if (data.sucesso) {
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = '/principal.html';
    }
  });
</script>
```

**O que faz:**
1. Usuário preenche email e senha
2. Clica em "Entrar"
3. JavaScript envia dados para `/api/login`
4. Se válido: salva usuário no `localStorage` e redireciona
5. Se inválido: mostra mensagem de erro

---

### 4️⃣ Listar Dados (usuario_listar.html)

```html
<table id="tabelaUsuarios">
  <thead>
    <tr><th>ID</th><th>Nome</th><th>E-mail</th></tr>
  </thead>
  <tbody id="tabelaUsuarios"></tbody>
</table>

<script>
  async function carregarUsuarios() {
    const response = await fetch('/api/usuarios');
    const usuarios = await response.json();
    
    const tbody = document.getElementById('tabelaUsuarios');
    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.id}</td><td>${u.nome}</td><td>${u.email}</td>`;
      tbody.appendChild(tr);
    });
  }
  
  carregarUsuarios();
</script>
```

**O que faz:**
1. Chama API `/api/usuarios`
2. Recebe lista de usuários em JSON
3. Para cada usuário: cria uma linha na tabela
4. Insere as linhas no `<tbody>`

**Resultado:** Tabela preenchida dinamicamente

---

### 5️⃣ Formulário de Inclusão (usuario_incluir.html)

```html
<form id="formUsuario">
  <input type="text" id="nome" required>
  <input type="email" id="email" required>
  <input type="password" id="senha" required>
  <button type="submit">Gravar</button>
</form>

<script>
  document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      senha: document.getElementById('senha').value
    };
    
    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (data.sucesso) {
      alert('Usuário incluído!');
      window.location.href = '/usuario/usuario_listar.html';
    }
  });
</script>
```

**O que faz:**
1. Usuário preenche formulário
2. Clica em "Gravar"
3. JavaScript envia dados para `/api/usuarios` (POST)
4. Se sucesso: redireciona para listagem
5. Se erro: mostra mensagem

---

### 6️⃣ Formulário de Edição (usuario_editar.html)

```javascript
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function carregarUsuario() {
  const response = await fetch('/api/usuarios');
  const usuarios = await response.json();
  const usuario = usuarios.find(u => u.id === parseInt(id));
  
  document.getElementById('nome').value = usuario.nome;
  document.getElementById('email').value = usuario.email;
}

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dados = { nome: ..., email: ..., senha: ... };
  
  await fetch(`/api/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  
  window.location.href = '/usuario/usuario_listar.html';
});
```

**O que faz:**
1. Extrai `id` da URL (ex: `?id=1`)
2. Carrega dados do usuário
3. Preenche formulário com dados atuais
4. Ao submeter: envia PUT para `/api/usuarios/1`
5. Redireciona para listagem

---

### 7️⃣ Deletar (usuario_listar.html)

```javascript
function excluir() {
  const marcados = document.querySelectorAll('input.user-check:checked');
  
  if (confirm("Tem certeza que deseja excluir?")) {
    marcados.forEach(async (checkbox) => {
      const id = checkbox.value;
      await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      carregarUsuarios();
    });
  }
}
```

**O que faz:**
1. Pega usuários selecionados (checkboxes)
2. Pede confirmação
3. Para cada selecionado: envia DELETE para `/api/usuarios/{id}`
4. Recarrega a tabela

---

## 📊 Fluxo de Dados

```
USUÁRIO INTERAGE COM PÁGINA HTML
         ↓
   JAVASCRIPT CAPTURA EVENTO
         ↓
   FETCH ENVIA REQUISIÇÃO HTTP
         ↓
   SERVIDOR EXPRESS RECEBE
         ↓
   MANIPULA DADOS (CRUD)
         ↓
   RETORNA JSON
         ↓
   JAVASCRIPT PROCESSA RESPOSTA
         ↓
   ATUALIZA HTML/REDIRECIONA
```

---

## 🔑 Conceitos-Chave

| Conceito | O que é | Exemplo |
|----------|---------|---------|
| **API REST** | Interface para comunicação cliente-servidor | `/api/usuarios` |
| **HTTP Methods** | Ações (GET, POST, PUT, DELETE) | POST para criar |
| **JSON** | Formato de dados estruturado | `{ "nome": "João" }` |
| **Fetch** | Função para fazer requisições HTTP | `fetch('/api/usuarios')` |
| **localStorage** | Armazenamento no navegador | `localStorage.setItem('usuario', ...)` |
| **DOM** | Elementos HTML manipuláveis | `document.getElementById()` |
| **Array Methods** | Operações em listas | `.find()`, `.map()`, `.splice()` |

---

## 🎓 Resumo Simples

**Backend (server.js):**
- Recebe requisições HTTP
- Manipula dados (CRUD)
- Retorna JSON

**Frontend (HTML + JS):**
- Mostra interface ao usuário
- Captura dados de formulários
- Envia para backend via `fetch()`
- Atualiza página com resposta

**Fluxo:** Usuário → Formulário → JavaScript → Fetch → Backend → Resposta → Atualiza Página

---

## ✅ Conclusão

O projeto usa:
- **Express** para criar servidor simples
- **REST API** para comunicação
- **Fetch** para requisições HTTP
- **DOM** para atualizar interface
- **localStorage** para manter sessão do usuário

Tudo integrado de forma simples e funcional! 🚀
