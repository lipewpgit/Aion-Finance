# Aion Finance

Painel financeiro pessoal com cadastro por e-mail e senha, dados separados por conta, calendário, lançamentos, orçamento, metas, saúde financeira e conversor de moedas.

## Desenvolvimento local

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://127.0.0.1:5173`. No ambiente local, o banco D1 é criado dentro da pasta ignorada `.wrangler`.

## Publicar na Vercel

1. Importe este repositório na Vercel.
2. Crie um banco PostgreSQL compatível com a Vercel, como Neon.
3. Nas variáveis de ambiente do projeto, adicione:

```env
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
```

4. Faça o deploy. O script de build detecta a Vercel automaticamente e usa o build do Next.js.

As tabelas necessárias são preparadas automaticamente no primeiro acesso ao banco. Senhas são armazenadas com hash PBKDF2; sessões usam cookie HTTP-only e cada conta acessa apenas os próprios lançamentos e compromissos.

## Comandos

```bash
npm run dev          # prévia local
npm run build        # build local/Sites
npm run vercel-build # build direto para Vercel
npm run db:generate  # gerar migrações do banco local
```

## Comportamento inicial

- Toda conta nova começa zerada e sem dados de demonstração.
- Lançamentos e compromissos ficam salvos por conta.
- O botão de reset apaga os dados financeiros e de calendário da conta atual.
- O conversor inclui real, dólar, euro e bitcoin.
