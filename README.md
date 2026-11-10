# Music Hub Review — Web

Front end do Music Hub Review, construído com Next.js App Router, React, TypeScript strict e Tailwind CSS v4.

## Requisitos locais

- Node.js 24 LTS (`.nvmrc` contém `24`).
- pnpm 12.18.0 (`packageManager` em `package.json`).
- Redis e FastAPI serão necessários quando a integração BFF/autenticação for implementada; não são necessários para executar a página inicial nesta fase.

## Instalação

```bash
# Com nvm instalado:
nvm install 24
nvm use 24

# Instale a versão fixada do pnpm:
npm install --global pnpm@12.18.0
pnpm --version

# Gere o lockfile inicial:
pnpm install
```

O primeiro `pnpm install` gera `pnpm-lock.yaml`. Revise alterações em `pnpm-workspace.yaml` resultantes de scripts de dependências, depois versione o lockfile. A CI utiliza `pnpm install --frozen-lockfile` e não deve gerar nem modificar o lockfile.

Scripts de instalação de dependências são negados por padrão. `esbuild` foi explicitamente aprovado porque seu script de instalação faz parte do fluxo de disponibilização/verificação do binário usado pelo toolchain Vite/Vitest. Novas dependências com scripts bloqueados devem ser inspecionadas antes de qualquer aprovação.

## Desenvolvimento

```bash
cp .env.example .env.local
pnpm dev
```

Acesse `http://localhost:3000`. Em produção, configure `APP_ORIGIN` com a origem HTTPS pública para habilitar HSTS e `upgrade-insecure-requests`.

## Qualidade

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm exec playwright install chromium
pnpm e2e
pnpm build
pnpm audit
```

O Playwright sobe o servidor de desenvolvimento automaticamente. A primeira execução precisa dos binários do navegador Chromium.

## Estrutura

```text
src/
├── app/                 # App Router, layouts, páginas e estados de rota
├── components/ui/       # Componentes shadcn/ui
├── features/            # Funcionalidades por domínio
└── lib/
    ├── api/generated/   # Cliente OpenAPI gerado (não editar manualmente)
    ├── auth/            # Sessões BFF e autenticação server-side
    ├── security/        # Cabeçalhos e políticas de segurança
    └── utils.ts         # Utilitários compartilhados

src/proxy.ts             # Nonce CSP e cabeçalhos de segurança
```

## Variáveis de ambiente

`FASTAPI_INTERNAL_URL`, `REDIS_URL`, `SESSION_SECRET` e `CSRF_SECRET` são variáveis exclusivamente server-side. Não use o prefixo `NEXT_PUBLIC_` para segredos.

Gere segredos independentes com:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

## Segurança

Consulte [`docs/security-headers.md`](docs/security-headers.md) para a descrição de cada diretiva e o trade-off da CSP com nonce.
