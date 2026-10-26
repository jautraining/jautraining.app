# Jau Training App

App de treinos da consultoria Jau Training. É um web app instalável (PWA): funciona no navegador do computador e do celular, e no celular pode ser adicionado à tela inicial como um aplicativo.

- **Personal** (conta `jauoliveira0902@gmail.com`): monta as fichas, a biblioteca de exercícios e os métodos, e acompanha os alunos.
- **Aluno**: vê a própria ficha, registra cargas e observações, e acompanha a evolução.

Custo: zero (GitHub, Supabase Free e Cloudflare Pages).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Página do app |
| `app.js` | Todo o funcionamento do app |
| `styles.css` | Visual (cores, fontes, layout de celular e de computador) |
| `config.js` | Endereço e chave pública do Supabase |
| `sw.js`, `manifest.webmanifest` | Instalação no celular e funcionamento sem internet |
| `supabase/schema.sql` | Estrutura do banco de dados e regras de acesso |
| `vendor/supabase.js` | Biblioteca oficial do Supabase |
| `img/` | Logo, guepardo e ícones |

## Como colocar no ar

### 1. Supabase (banco de dados e login)

1. Crie o projeto na região **South America (São Paulo)**.
2. **SQL Editor** → New query → cole todo o `supabase/schema.sql` → **Run**.
3. **Authentication → URL Configuration**:
   - Site URL: o endereço do app (ex.: `https://jau-training.pages.dev`)
   - Redirect URLs: adicione o mesmo endereço seguido de `/**`
4. **Authentication → Sign In / Providers → Email**: deixe **Confirm email** ligado.
5. **Authentication → Emails → SMTP Settings** (sem isso, só você recebe e-mails):
   - Host `smtp.gmail.com`, porta `465`
   - Usuário: seu Gmail · Senha: a **senha de app** do Google (não a senha normal)
   - Sender email: seu Gmail · Sender name: `Jau Training`
6. **Authentication → Emails → Templates**: troque os textos para português (modelos abaixo).
7. **Project Settings → API**: copie o **Project URL** e a chave **anon / publishable** para o `config.js`.
   Nunca use a chave `service_role` / `secret` no app.

### 2. Cloudflare Pages (hospedagem)

Workers & Pages → Create → Pages → **Connect to Git** → escolha o repositório.

- Framework preset: **None**
- Build command: *(vazio)*
- Build output directory: `/`

Cada alteração enviada ao GitHub vai pro ar sozinha em ~1 minuto.

### 3. Primeiro acesso

1. Abra o app e toque em **Criar conta** com o e-mail de personal. Confirme pelo e-mail.
2. Na primeira entrada, o app cria a biblioteca de exercícios e os métodos padrão.
3. Cadastre o aluno com o **e-mail dele** e toque em **Enviar convite**.
4. O aluno cria a conta com esse mesmo e-mail, confirma, aceita os termos e a ficha aparece.

## Modelos de e-mail (português)

**Confirm signup**: assunto `Confirme sua conta no Jau Training`

```html
<h2>Bem-vindo ao Jau Training!</h2>
<p>Toque no botão abaixo para confirmar o seu e-mail e ativar a sua conta.</p>
<p><a href="{{ .ConfirmationURL }}" style="background:#A50000;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Confirmar minha conta</a></p>
<p style="color:#666;font-size:13px">Se você não criou esta conta, é só ignorar este e-mail.</p>
```

**Reset password**: assunto `Crie uma senha nova no Jau Training`

```html
<h2>Recuperar acesso</h2>
<p>Recebemos um pedido para trocar a sua senha. Toque no botão abaixo para criar uma senha nova.</p>
<p><a href="{{ .ConfirmationURL }}" style="background:#A50000;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Criar senha nova</a></p>
<p style="color:#666;font-size:13px">Se não foi você, é só ignorar este e-mail. Sua senha continua a mesma.</p>
```

## Segurança e privacidade

- Cada aluno só enxerga a própria ficha e os próprios treinos (regras de acesso no banco, não só na tela).
- As anotações privadas ficam numa tabela separada que só a conta de personal lê.
- A conta do aluno só é ligada à ficha depois que o e-mail é confirmado.
- No primeiro acesso, o aluno aceita os termos e, separadamente, autoriza o uso de dados de saúde (LGPD). A data e a versão do aceite ficam registradas.
- Pendente antes do lançamento: revisão dos termos por advogado.

## Funcionamento sem internet

O app abre e registra treinos sem sinal. Tudo fica salvo no aparelho e é enviado ao banco quando a conexão volta (aparece um aviso no topo enquanto isso).
