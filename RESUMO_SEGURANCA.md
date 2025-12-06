# Estudo de Caso de Segurança de Aplicações Web - Resumo de Vulnerabilidades

## Sumário Executivo

Auto-auditoria de uma aplicação web Node.js/Express, projetada como um estudo de caso de segurança, identificando vulnerabilidades críticas e documentando estratégias de remediação. O projeto demonstra tanto a implementação de autenticação avançada quanto falhas de segurança fundamentais.

## Controles de Segurança Implementados

- ✅ **Autenticação Multifator (2FA) baseada em TOTP**
- ✅ **Design de Controle de Acesso Baseado em Papéis (RBAC)**
- ✅ **Prevenção Conceitual de Injeção** (via acesso a dados baseado em array)
- ✅ **Tratamento Seguro de Erros** (mensagens genéricas)

## Vulnerabilidades Identificadas (Estudo Intencional)

### 1. Armazenamento Inseguro de Senhas (CRÍTICO)

**Risco:** OWASP A02:2021 - Falhas Criptográficas | CWE-259: Uso de Senha Hard-coded

**Descoberta:** Senhas armazenadas em texto simples no array de usuários em memória (linhas 19-21 em `server.js`). Qualquer acesso ao código-fonte ou memória da aplicação expõe imediatamente todas as credenciais.

**Remediação:** Implementar *hashing* de senha unidirecional com *salt* usando **bcrypt** (fator de custo mínimo 12) ou **Argon2**. Exemplo:

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(senhaSimples, saltRounds);
```

### 2. Controle de Acesso Quebrado (CRÍTICO)

**Risco:** OWASP A01:2021 - Controle de Acesso Quebrado | CWE-862: Falta de Autorização

**Descoberta:** *Endpoints* de API CRUD (linhas 195-297 em `server.js`) não possuem verificações de autorização baseadas em papéis. Qualquer usuário autenticado pode realizar operações administrativas (criar, atualizar, excluir usuários, clientes e fornecedores).

**Remediação:** Implementar *middleware* de autorização para verificar papéis de usuário antes de todas as operações sensíveis. Exemplo:

```javascript
function requireRole(role) {
  return (req, res, next) => {
    if (!usuarioLogado || usuarioLogado.perfil !== role) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    next();
  };
}

app.delete('/api/usuarios/:id', requireRole('Administrador'), ...);
```

### 3. Gerenciamento Inseguro de Sessão (ALTO)

**Risco:** OWASP A07:2021 - Falhas de Identificação e Autenticação | CWE-362: Condição de Corrida Concorrente

**Descoberta:** Variável global única `usuarioLogado` (linha 33 em `server.js`) gerencia o estado de sessão para todos os usuários, causando condições de corrida em ambientes multi-usuário e impedindo escalabilidade.

**Remediação:** Implementar gerenciamento de sessão robusto usando **JSON Web Tokens (JWT)** para autenticação *stateless* ou *middleware* de sessão do Express (`express-session`) com armazenamento seguro (Redis, MongoDB). Exemplo JWT:

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, 
                        process.env.JWT_SECRET, 
                        { expiresIn: '1h' });
```

### 4. Falta de Validação de Entrada (MÉDIO)

**Risco:** OWASP A03:2021 - Injeção | CWE-20: Validação de Entrada Inadequada

**Descoberta:** Entrada do usuário não é sanitizada ou validada antes do armazenamento. Embora o uso de arrays mitigue SQL Injection, a falta de validação permite dados malformados, XSS em campos de texto, e possíveis ataques de injeção em outras camadas.

**Remediação:** Implementar validação de entrada robusta usando `express-validator` e sanitização. Exemplo:

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/usuarios', [
  body('nome').trim().isLength({ min: 3, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('senha').isStrongPassword()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Processar requisição...
});
```

## Resultados de Aprendizagem

- Implementação prática de **Autenticação Multifator (TOTP)**
- Compreensão prática de falhas de **Autenticação vs. Autorização**
- Experiência com identificação e análise de vulnerabilidades **OWASP Top 10**
- Documentação de segurança e planejamento profissional de remediação

---

## Referências

[1] OWASP Foundation. (2021). *OWASP Top 10 - 2021*. Disponível em: https://owasp.org/www-project-top-ten/

[2] MITRE Corporation. (2023). *Common Weakness Enumeration (CWE)*. Disponível em: https://cwe.mitre.org/

[3] Express.js Security Best Practices. (2024). *Production Best Practices: Security*. Disponível em: https://expressjs.com/en/advanced/best-practice-security.html

[4] IETF. (2011). *TOTP: Time-Based One-Time Password Algorithm (RFC 6238)*. Disponível em: https://datatracker.ietf.org/doc/html/rfc6238

[5] OWASP. (2023). *Node.js Security Cheat Sheet*. Disponível em: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
