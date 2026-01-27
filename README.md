# Home Alone Tracker

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase)

**Planejador financeiro pessoal para quem esta se preparando para morar sozinho**

[Demo](https://home-alone-tracker.vercel.app) · [Reportar Bug](https://github.com/seu-usuario/home-alone-tracker/issues)

</div>

---

## Sobre o Projeto

O **Home Alone Tracker** e uma aplicacao web completa para ajudar pessoas que estao planejando sua primeira moradia independente. Ele permite controlar gastos mensais, planejar compras de itens essenciais, simular cenarios financeiros e acompanhar o checklist de tarefas pre-mudanca.

### Por que usar?

- **Planejamento completo**: Desde gastos mensais ate lista de compras
- **Simulacao de cenarios**: Teste diferentes configuracoes de gastos antes de se comprometer
- **Sincronizacao em tempo real**: Acesse de qualquer dispositivo com Supabase
- **Interface intuitiva**: Design limpo e responsivo com Tailwind CSS
- **Sem dependencia de conta**: Funciona offline com localStorage

---

## Funcionalidades

### Dashboard
- Visao geral do saldo mensal
- Grafico de distribuicao de gastos por categoria
- Progresso das compras (pre e pos-mudanca)
- Proximos passos do checklist

### Gastos Mensais
- Cadastro de gastos fixos e variaveis
- Organizacao por categorias (Moradia, Saude, Assinaturas, Insumos)
- Separacao por fonte (Salario ou Beneficio)
- Ativar/desativar gastos para simulacao

### Lista de Compras
- Itens organizados por fase (Pre-mudanca e Pos-mudanca)
- Prioridades (Essencial, Alta, Media, Baixa)
- Controle de poupanca por item
- Status de compra com valores reais

### Simulador de Cenarios
- Ajuste valores de gastos com sliders
- Modifique renda temporariamente
- Salve cenarios para comparacao futura
- Visualize impacto no saldo em tempo real

### Checklist de Mudanca
- Lista de tarefas pre-mudanca
- Datas alvo e observacoes
- Acompanhamento de progresso

---

## Tech Stack

| Tecnologia | Descricao |
|------------|-----------|
| [Next.js 16](https://nextjs.org/) | Framework React com App Router |
| [React 19](https://react.dev/) | Biblioteca UI |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipagem estatica |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilizacao utility-first |
| [Radix UI](https://www.radix-ui.com/) | Componentes acessiveis |
| [Recharts](https://recharts.org/) | Graficos interativos |
| [Supabase](https://supabase.com/) | Backend e banco de dados |
| [Lucide React](https://lucide.dev/) | Icones |

---

## Instalacao

### Pre-requisitos

- Node.js 18+
- npm, yarn ou pnpm

### Passos

1. **Clone o repositorio**
   ```bash
   git clone https://github.com/seu-usuario/home-alone-tracker.git
   cd home-alone-tracker
   ```

2. **Instale as dependencias**
   ```bash
   npm install
   ```

3. **Configure as variaveis de ambiente** (opcional - para sincronizacao)
   ```bash
   cp .env.local.example .env.local
   ```

   Edite o arquivo `.env.local` com suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```

4. **Configure o banco de dados** (opcional - para sincronizacao)

   Execute o script SQL no Supabase SQL Editor:
   ```bash
   # O schema esta em: supabase/schema.sql
   ```

5. **Crie um usuário para autenticação**

   No dashboard do Supabase:
   - Acesse: `Authentication > Users`
   - Clique em `Add user > Create new user`
   - Preencha email e senha
   - Marque `Auto Confirm User`
   - Salvar

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

7. Acesse [http://localhost:3000](http://localhost:3000) e faça login com suas credenciais

---

## Configuracao do Supabase

O app funciona **100% offline** usando localStorage. Para habilitar sincronizacao entre dispositivos:

### 1. Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto

### 2. Execute o schema SQL
- Va em **SQL Editor** no dashboard do Supabase
- Cole e execute o conteudo de `supabase/schema.sql`

### 3. Configure as variaveis de ambiente
- Copie a URL e a chave anon de **Settings > API**
- Adicione ao `.env.local` ou nas variaveis de ambiente da Vercel

### 4. Crie um usuário de autenticação
- Va em **Authentication > Users**
- Clique em **Add user > Create new user**
- Preencha email e senha
- Marque **Auto Confirm User**
- Salvar

### 5. Habilite Realtime
O schema ja configura o Realtime automaticamente para sincronizacao instantanea entre dispositivos.

### 5. Configure a autenticação (se estiver publicado)
Se o app estiver publicado, é importante proteger com autenticação:

1. No dashboard do Supabase, vá em **Authentication > Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - Email: seu@email.com
   - Password: senha_segura
   - Auto Confirm User: ✓ (marcar)
4. Salvar

Agora você pode fazer login na aplicação com essas credenciais.

---

## Deploy

### Vercel (Recomendado)

1. Conecte seu repositorio na [Vercel](https://vercel.com)

2. Adicione as variaveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Deploy automatico a cada push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/home-alone-tracker)

---

## Estrutura do Projeto

```
home-alone-tracker/
├── src/
│   ├── app/                    # App Router (paginas)
│   │   ├── page.tsx            # Dashboard
│   │   ├── mensal/             # Gastos mensais
│   │   ├── compras/            # Lista de compras
│   │   ├── simulador/          # Simulador de cenarios
│   │   └── checklist/          # Checklist de mudanca
│   ├── components/             # Componentes React
│   │   ├── dashboard/          # Componentes do dashboard
│   │   ├── gastos/             # Componentes de gastos
│   │   ├── compras/            # Componentes de compras
│   │   └── ui/                 # Componentes base (shadcn/ui)
│   ├── hooks/                  # Custom hooks
│   │   ├── useAppState.ts      # Estado global
│   │   └── useSupabase.ts      # Integracao Supabase
│   ├── lib/                    # Utilitarios
│   │   ├── supabase.ts         # Cliente Supabase
│   │   └── calculations.ts     # Calculos financeiros
│   ├── types/                  # Tipos TypeScript
│   └── data/                   # Dados iniciais (seed)
├── supabase/
│   └── schema.sql              # Schema do banco de dados
└── public/                     # Assets estaticos
```

---

## Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run start` | Inicia servidor de producao |
| `npm run lint` | Executa ESLint |

---

## Contribuindo

Contribuicoes sao bem-vindas! Sinta-se a vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abrir um Pull Request

---

## Licenca

Distribuido sob a licenca MIT. Veja `LICENSE` para mais informacoes.

---

<div align="center">

**[Voltar ao topo](#home-alone-tracker)**

</div>
