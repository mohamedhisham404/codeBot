## Description

This repo have many services to deal with LLM Models<br>

#### code :<br> 
To chat with LLM about your code, which sends its paths in an array in the request<br>

#### database-llm : <br>
It sends all data in the database and the schema to answer questions and make bindings about the data

#### database-pinding
It has many funtions to deal with database and LLM :-<br>
1- conditionalPinding: to make bindings with all of my data with conditions<br>
2- idPinding: to answer questions or make bindings with specific data<br>
&emsp;&emsp;the request should be like: userPrompt@userId=...,@postId<br>
3-entityPinding: Here the requirments became more flexable just send the prompt like that :<br>
&emsp;&emsp;prompt@data...and the code will take the rest of work
## Project clone

```bash
$ git clone https://github.com/mohamedhisham404/codeBot
```
## Project setup

```bash
$ npm install
```

## add .env

```bash
LANGSMITH_TRACING = true
LANGSMITH_API_KEY = ....
GROQ_API_KEY = ....

DB_USERNAME = ....
DB_PASSWORD = ....
DB_DATABASE = ....
DB_HOST = localhost
DB_PORT = 5432
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

