# Projeto de Segurança

## I. Resumo Profissional Conciso

**Estudo de Caso de Segurança de Aplicações Web: Autenticação, Autorização e Fluxo de Dados — 2025**

Projeto educacional explorando o desenvolvimento seguro de aplicações e a análise de vulnerabilidades. Implementou **Autenticação Multifator baseada em TOTP** e projetou **Controle de Acesso Baseado em Papéis (RBAC)**. Focado em entender como as ações do usuário se traduzem em operações de dados, enquanto demonstra intencionalmente falhas críticas como **Controle de Acesso Quebrado** e **Armazenamento Inseguro de Senhas** para análise prática de segurança.

---

## II. Relatório de Vulnerabilidade de Segurança

**Projeto:** Aplicação Web Simples (Sistema CRUD Node.js/Express)

**Código-Fonte:** `web-app.zip`

**Data da Avaliação:** 6 de Dezembro de 2025

**Auto-Auditoria**

### Sumário Executivo

Este relatório detalha as descobertas de uma auto-auditoria de segurança realizada na Aplicação Web Simples. A aplicação implementa com sucesso um controle robusto, a **Autenticação Multifator (MFA) baseada em TOTP**, demonstrando proficiência em gerenciamento moderno de identidade. No entanto, a auditoria identificou três vulnerabilidades críticas relacionadas à proteção de dados e autorização: **Armazenamento Inseguro de Senhas**, **Controle de Acesso Quebrado** e **Gerenciamento Inseguro de Sessão**. Essas vulnerabilidades, embora intencionais para fins educacionais, representam riscos graves que exigem remediação imediata em um ambiente de produção. O relatório fornece descobertas detalhadas, classificações de risco baseadas no Common Vulnerability Scoring System (CVSS) e etapas concretas de remediação.

### Descobertas

A tabela a seguir resume as vulnerabilidades identificadas, sua gravidade e a categoria correspondente no OWASP Top 10.

| ID | Vulnerabilidade | Gravidade | OWASP Top 10 (2021) | Pontuação CVSS v3.1 |
|:---|:---|:---|:---|:---|
| **V-01** | Armazenamento Inseguro de Senhas (Texto Simples) | **Crítica** | A02:2021 – Falhas Criptográficas | 9.8 (Crítica) |
| **V-02** | Controle de Acesso Quebrado (Autorização Ausente) | **Crítica** | A01:2021 – Controle de Acesso Quebrado | 9.0 (Crítica) |
| **V-03** | Gerenciamento Inseguro de Sessão (Variável Global) | **Alta** | A07:2021 – Falhas de Identificação e Autenticação | 7.5 (Alta) |

#### V-01: Armazenamento Inseguro de Senhas (Texto Simples)

- **Descrição:** As senhas dos usuários são armazenadas em texto simples dentro do array `usuarios` em memória (linhas 19-21 em `server.js`). Isso significa que qualquer comprometimento da memória ou do código-fonte da aplicação expõe imediatamente todas as credenciais dos usuários.
- **CWE:** CWE-259: Uso de Senha Hard-coded
- **Impacto:** Comprometimento completo das contas de usuário. Uma violação de dados exporia todas as senhas dos usuários, levando a potenciais ataques de *credential stuffing* em outros serviços e reutilização de credenciais em outras plataformas.
- **Código Afetado:** `server.js`, linhas 19-21 (inicialização do array de usuários) e linha 62 (verificação de login).
- **Remediação:** Implementar um algoritmo forte de *hashing* de senha unidirecional com *salting*, como **bcrypt** (fator de custo mínimo 12) ou **Argon2**. A senha deve ser *hashed* antes do armazenamento, e o processo de login deve comparar a senha fornecida com o *hash* armazenado usando a função de verificação apropriada.

  ```javascript
  const bcrypt = require('bcrypt');
  const saltRounds = 12;
  
  // Ao criar usuário
  const hashedPassword = await bcrypt.hash(senhaSimples, saltRounds);
  
  // Ao autenticar
  const match = await bcrypt.compare(senhaFornecida, senhaHashArmazenada);
  ```

#### V-02: Controle de Acesso Quebrado (Autorização Ausente)

- **Descrição:** Os *endpoints* CRUD da aplicação para usuários, clientes e fornecedores (linhas 195-297 em `server.js`) não realizam nenhuma verificação de autorização baseada no `perfil` (papel) do usuário logado. Qualquer usuário autenticado pode realizar ações administrativas, como criar, atualizar ou excluir outros usuários.
- **CWE:** CWE-862: Falta de Autorização
- **Impacto:** Modificação não autorizada de dados, exclusão e escalonamento de privilégios. Um usuário padrão pode obter controle administrativo total sobre os dados e a base de usuários do sistema, violando o princípio do menor privilégio.
- **Código Afetado:** Todos os *endpoints* CRUD (por exemplo, `app.delete('/api/usuarios/:id'`, linha 219).
- **Remediação:** Implementar uma verificação de autorização obrigatória (*middleware*) no início de cada *endpoint* de API sensível. Essa verificação deve garantir que o `usuarioLogado.perfil` tenha as permissões necessárias (por exemplo, 'Administrador') antes de permitir que a operação prossiga.

  ```javascript
  function requireRole(role) {
    return (req, res, next) => {
      if (!usuarioLogado || usuarioLogado.perfil !== role) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }
      next();
    };
  }
  
  app.delete('/api/usuarios/:id', requireRole('Administrador'), (req, res) => {
    // Lógica de exclusão
  });
  ```

#### V-03: Gerenciamento Inseguro de Sessão (Variável Global)

- **Descrição:** A sessão do usuário é gerenciada por uma única variável global, `usuarioLogado` (linha 33 em `server.js`). Essa abordagem não é segura nem escalável.
- **CWE:** CWE-362: Condição de Corrida Concorrente
- **Impacto:** Em um ambiente multiusuário, este design é propenso a condições de corrida (*race conditions*), onde a sessão de um usuário pode sobrescrever a de outro, levando a decisões de autorização incorretas, vazamento de dados entre sessões ou negação de serviço. Também impede que a aplicação escale horizontalmente para lidar com múltiplos usuários concorrentes.
- **Código Afetado:** `server.js`, linhas 33, 70, 79 e todas as verificações subsequentes para `usuarioLogado`.
- **Remediação:** Substituir a variável global por um mecanismo de gerenciamento de sessão robusto e padrão da indústria. Isso geralmente envolve o uso de **JSON Web Tokens (JWT)** para autenticação *stateless* ou *middleware* de sessão do Express (`express-session`) para gerenciar IDs de sessão armazenados em *cookies* seguros, HttpOnly e com flag SameSite.

  ```javascript
  const jwt = require('jsonwebtoken');
  
  // Ao fazer login
  const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
  
  // Middleware de verificação
  function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ erro: 'Token inválido' });
      req.usuario = decoded;
      next();
    });
  }
  ```

### Conclusão

A Aplicação Web Simples serve como uma excelente ferramenta educacional, demonstrando tanto a implementação de um controle de segurança moderno (MFA baseado em TOTP) quanto as consequências de negligenciar princípios fundamentais de segurança (*hashing* de senha, controle de acesso, gerenciamento de sessão). A próxima fase de desenvolvimento deve priorizar a remediação das vulnerabilidades críticas (V-01 e V-02) para fazer a transição da aplicação para uma arquitetura segura pronta para produção. A implementação bem-sucedida do TOTP 2FA deve ser destacada como uma conquista chave em gerenciamento de identidade e acesso.

---

### Referências

[1] OWASP Foundation. (2021). *OWASP Top 10 - 2021*. Disponível em: https://owasp.org/www-project-top-ten/

[2] FIRST. (2023). *Common Vulnerability Scoring System (CVSS) v3.1*. Disponível em: https://www.first.org/cvss/v3.1/

[3] MITRE Corporation. (2023). *Common Weakness Enumeration (CWE)*. Disponível em: https://cwe.mitre.org/

[4] Express.js. (2024). *Production Best Practices: Security*. Disponível em: https://expressjs.com/en/advanced/best-practice-security.html

[5] IETF. (2011). *TOTP: Time-Based One-Time Password Algorithm (RFC 6238)*. Disponível em: https://datatracker.ietf.org/doc/html/rfc6238
