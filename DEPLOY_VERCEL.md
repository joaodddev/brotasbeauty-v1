Deploy rápido do frontend (Angular) para o repositório `joaodddev/brotasbeauty-v1` e Vercel

Resumo: vamos copiar o projeto Angular para o repositório, garantir que `package.json` e `vercel.json` existam no root, e conectar o repo no Vercel com build `npm run build` e output `dist/brotas-beauty-frontend`.

Passos (local):

1) Clone o repositório alvo:

```bash
git clone git@github.com:joaodddev/brotasbeauty-v1.git
cd brotasbeauty-v1
```

2) Opcional: backup dos arquivos antigos

```bash
mkdir ../brotasbeauty-v1-backup
cp -r . ../brotasbeauty-v1-backup/
```

3) Copiar o projeto Angular para o root do repositório (a partir do seu workspace):

```bash
# assumindo que você está em /home/joao/projetos-web/brotas-beauty-system
cp -r brotas-beauty-frontend/* brotasbeauty-v1/
# Não copie node_modules
rm -rf brotasbeauty-v1/node_modules
```

4) Garanta que exista `vercel.json` no root do repo (já fornecido no projeto):

`vercel.json` define o `distDir` como `dist/brotas-beauty-frontend`.

5) Commit e push:

```bash
cd brotasbeauty-v1
git add .
git commit -m "Add Angular frontend for Brotas Beauty"
git push origin main
```

6) Configure o projeto no Vercel:

- Entre em https://vercel.com, clique em "New Project" → "Import Git Repository".
- Escolha `joaodddev/brotasbeauty-v1`.
- Em "Build & Output Settings":
  - Build Command: `npm run build`
  - Install Command: `npm ci` (ou `npm install`)
  - Output Directory: `dist/brotas-beauty-frontend`
- Se preferir não usar a interface, instale o Vercel CLI e rode:

```bash
npm i -g vercel
vercel login
cd brotasbeauty-v1
vercel --prod
```

7) Após deploy: verifique a URL gerada pelo Vercel.

Notas e dicas:
- Se o repo original tem um site estático antigo e você quer manter ambos, coloque o Angular app em uma subpasta e ajuste `vercel.json` ou as configurações do Vercel.
- Para rotas do Angular que não sejam estáticas, certifique-se de que o `vercel.json` roteie para `index.html` (já incluído).
- Para um projeto fullstack futuro, remova `localStorage` do frontend e aponte para uma API (você pode usar `api/` serverless na Vercel ou um backend separado em Render/Railway).

Se quiser, eu posso:
- criar um commit pronto nesta workspace com `vercel.json` e `DEPLOY_VERCEL.md` (já feito), ou
- preparar um script de cópia e commit (ex.: `deploy-to-remote.sh`) que você possa executar para sincronizar com o repo remoto.

Qual opção prefere?