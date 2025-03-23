# Use a imagem base oficial do Bun
FROM oven/bun:latest

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos package.json e bun.lockb para o container
COPY package*.json bun.lock ./

# Instala as dependências do projeto
RUN bun install

# Copia o restante dos arquivos do projeto para o container
COPY . .

# Expõe a porta em que o Fastify estará escutando
EXPOSE 3000

# Comando para iniciar a aplicação Fastify
CMD ["bun", "run", "server"]