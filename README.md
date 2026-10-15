# Catálogo de Produtos

Frontend React/Vite para cadastrar e gerenciar os produtos armazenados pela API do projeto `vite-project`.

## Executar localmente

1. Configure `VITE_API_URL` em `.env.local`. Use `http://localhost:3001` se a API estiver rodando localmente. O arquivo `.env.example` serve como modelo.
2. Instale as dependências com `npm install`.
3. Inicie o frontend com `npm run dev`.

O painel consome `GET`, `POST`, `PATCH` e `DELETE` em `/api/produtos`. O backend precisa estar em execução e aceitar CORS da origem do Vite.