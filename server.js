const express = require('express');
const cors = require('cors');
const path = require('path');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Dados em memória (simples)
let usuarios = [
  // Adicionado campos para 2FA: twoFactorSecret e twoFactorEnabled

  { id: 1, nome: 'João Silva', email: 'joao@example.com', login: 'joao', senha: '123', perfil: 'Administrador', twoFactorSecret: null, twoFactorEnabled: false },
  { id: 2, nome: 'Maria Oliveira', email: 'maria@example.com', login: 'maria', senha: '123', perfil: 'Usuário', twoFactorSecret: null, twoFactorEnabled: false }
];

let clientes = [
  { id: 1, nome: 'Cliente A', email: 'clientea@example.com', telefone: '1234567890' },
  { id: 2, nome: 'Cliente B', email: 'clienteb@example.com', telefone: '0987654321' }
];

let fornecedores = [
  { id: 1, nome: 'Fornecedor X', email: 'fornecedor@example.com', telefone: '1111111111' },
  { id: 2, nome: 'Fornecedor Y', email: 'fornecedor2@example.com', telefone: '2222222222' }
];

let usuarioLogado = null;

// ============ LOGIN ============

// Endpoint para verificar o código 2FA
app.post('/api/login/2fa', (req, res) => {
  const { email, token } = req.body;
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario || !usuario.twoFactorEnabled || !usuario.twoFactorSecret) {
    return res.status(400).json({ sucesso: false, mensagem: '2FA não configurado ou usuário não encontrado.' });
  }

  const verified = speakeasy.totp.verify({
    secret: usuario.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 1 // Permite um desvio de 30 segundos (1 janela)
  });

  if (verified) {
    usuarioLogado = usuario;
    res.json({ sucesso: true, usuario });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Código 2FA inválido.' });
  }
});
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (usuario) {
    if (usuario.twoFactorEnabled) {
      // Se 2FA ativado, solicita o código
      res.json({ sucesso: true, requires2FA: true, email: usuario.email });
    } else {
      // Login direto se 2FA desativado
      usuarioLogado = usuario;
      res.json({ sucesso: true, usuario });
    }
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
  }
});

app.post('/api/logout', (req, res) => {
  usuarioLogado = null;
  res.json({ sucesso: true });
});

// ============ 2FA MANAGEMENT ============

// Endpoint para iniciar a configuração do 2FA
app.post('/api/2fa/setup', (req, res) => {
  if (!usuarioLogado) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não logado.' });
  }

  const usuario = usuarios.find(u => u.id === usuarioLogado.id);
  if (!usuario) {
    return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
  }

  // Gera um novo segredo 2FA
  const secret = speakeasy.generateSecret({
    name: `SimpleWebApp (${usuario.email})`,
    issuer: 'SimpleWebApp'
  });

  // Salva o segredo temporariamente (não ativado ainda)
  usuario.twoFactorSecret = secret.base32;

  // Gera o URL do código QR
  const otpauthUrl = secret.otpauth_url;

  // Gera o QR code como um data URL
  qrcode.toDataURL(otpauthUrl, (err, data_url) => {
    if (err) {
      console.error('Erro ao gerar QR code:', err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar QR code.' });
    }

    // O código 2FA gerado é exibido no console do servidor, conforme solicitado
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32'
    });
    console.log(`\n========================================================`);
    console.log(`CÓDIGO 2FA TEMPORÁRIO PARA ${usuario.email}: ${token}`);
    console.log(`========================================================\n`);

    res.json({
      sucesso: true,
      qrCodeUrl: data_url,
      secret: secret.base32 // O segredo é enviado para o cliente para fins de demonstração/depuração
    });
  });
});

// Endpoint para finalizar a configuração do 2FA (verificar e ativar)
app.post('/api/2fa/verify-and-enable', (req, res) => {
  if (!usuarioLogado) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não logado.' });
  }

  const { token } = req.body;
  const usuario = usuarios.find(u => u.id === usuarioLogado.id);

  if (!usuario || !usuario.twoFactorSecret) {
    return res.status(400).json({ sucesso: false, mensagem: 'Configuração 2FA pendente.' });
  }

  const verified = speakeasy.totp.verify({
    secret: usuario.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 1
  });

  if (verified) {
    usuario.twoFactorEnabled = true;
    res.json({ sucesso: true, mensagem: '2FA ativado com sucesso!' });
  } else {
    // Se a verificação falhar, o segredo temporário é mantido para nova tentativa
    res.status(401).json({ sucesso: false, mensagem: 'Código 2FA inválido. Tente novamente.' });
  }
});

// Endpoint para desativar o 2FA
app.post('/api/2fa/disable', (req, res) => {
  if (!usuarioLogado) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não logado.' });
  }

  const usuario = usuarios.find(u => u.id === usuarioLogado.id);
  if (!usuario) {
    return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
  }

  usuario.twoFactorEnabled = false;
  usuario.twoFactorSecret = null; // Limpa o segredo
  res.json({ sucesso: true, mensagem: '2FA desativado com sucesso.' });
});

// Endpoint para obter o status do 2FA
app.get('/api/2fa/status', (req, res) => {
  if (!usuarioLogado) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não logado.' });
  }

  const usuario = usuarios.find(u => u.id === usuarioLogado.id);
  if (!usuario) {
    return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
  }

  res.json({
    sucesso: true,
    twoFactorEnabled: usuario.twoFactorEnabled
  });
});

// ============ USUÁRIOS ============
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

app.post('/api/usuarios', (req, res) => {
  const { nome, email, login, senha, perfil } = req.body;
  const novoUsuario = {
    id: Math.max(...usuarios.map(u => u.id), 0) + 1,
    nome, email, login, senha, perfil
  };
  usuarios.push(novoUsuario);
  res.json({ sucesso: true, usuario: novoUsuario });
});

app.put('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
  if (usuario) {
    Object.assign(usuario, req.body);
    res.json({ sucesso: true, usuario });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
  }
});

app.delete('/api/usuarios/:id', (req, res) => {
  const index = usuarios.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    usuarios.splice(index, 1);
    res.json({ sucesso: true });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
  }
});

// ============ CLIENTES ============
app.get('/api/clientes', (req, res) => {
  res.json(clientes);
});

app.post('/api/clientes', (req, res) => {
  const { nome, email, telefone } = req.body;
  const novoCliente = {
    id: Math.max(...clientes.map(c => c.id), 0) + 1,
    nome, email, telefone
  };
  clientes.push(novoCliente);
  res.json({ sucesso: true, cliente: novoCliente });
});

app.put('/api/clientes/:id', (req, res) => {
  const cliente = clientes.find(c => c.id === parseInt(req.params.id));
  if (cliente) {
    Object.assign(cliente, req.body);
    res.json({ sucesso: true, cliente });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
  }
});

app.delete('/api/clientes/:id', (req, res) => {
  const index = clientes.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    clientes.splice(index, 1);
    res.json({ sucesso: true });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
  }
});

// ============ FORNECEDORES ============
app.get('/api/fornecedores', (req, res) => {
  res.json(fornecedores);
});

app.post('/api/fornecedores', (req, res) => {
  const { nome, email, telefone } = req.body;
  const novoFornecedor = {
    id: Math.max(...fornecedores.map(f => f.id), 0) + 1,
    nome, email, telefone
  };
  fornecedores.push(novoFornecedor);
  res.json({ sucesso: true, fornecedor: novoFornecedor });
});

app.put('/api/fornecedores/:id', (req, res) => {
  const fornecedor = fornecedores.find(f => f.id === parseInt(req.params.id));
  if (fornecedor) {
    Object.assign(fornecedor, req.body);
    res.json({ sucesso: true, fornecedor });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Fornecedor não encontrado' });
  }
});

app.delete('/api/fornecedores/:id', (req, res) => {
  const index = fornecedores.findIndex(f => f.id === parseInt(req.params.id));
  if (index !== -1) {
    fornecedores.splice(index, 1);
    res.json({ sucesso: true });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Fornecedor não encontrado' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
