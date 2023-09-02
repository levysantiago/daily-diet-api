[![Node.js CI](https://github.com/levysantiago/daily-diet-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/levysantiago/daily-diet-api/actions/workflows/node.js.yml)

# Daily Diet
Esta aplicação é um dos desafios da trilha Ignite da plataforma da Rocketseat. Aqui utilizo o Knex como ORM, SQLite como banco de dados e o Fastify como framework backend.

Este é o [link do Figma](https://www.figma.com/community/file/1218573349379609244/Daily-Diet-%E2%80%A2-Desafio-React-Native) do desing de como seria a aplicação frontend.

## Getting started

### Instalando Dependências

```
npm i
```

ou


```
yarn
```

### Rodando migrations

```
npx knex migrate:latest
```

### Iniciando aplicação

```
npm run dev
```

ou

```
yarn dev
```

### Regras da aplicação

- [x] Deve ser possível criar um usuário

- [x] Deve ser possível identificar o usuário entre as requisições

- [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
    
  *As refeições devem ser relacionadas a um usuário.*
  
  - Nome
  - Descrição
  - Data e Hora
  - Está dentro ou não da dieta
  
- [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima

- [x] Deve ser possível apagar uma refeição

- [x] Deve ser possível listar todas as refeições de um usuário

- [x] Deve ser possível visualizar uma única refeição

- [x] Deve ser possível recuperar as métricas de um usuário

  - [x] Quantidade total de refeições registradas

  - [x] Quantidade total de refeições dentro da dieta

  - [x] Quantidade total de refeições fora da dieta

  - [x] Melhor sequência de refeições dentro da dieta

- [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou