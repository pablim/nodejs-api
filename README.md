### Executando o backend

1. Através do console entre na pasta do projeto (**nodejs-api**) `cd coodesh-challenge/nodejs-api`. 
2. Crie a imagem do projeto com o Docker utilizando o comando `sudo docker build -t nodejs-api .` (não esqueça de incluir o ponto "." após o nome do diretório no comando anterior) 
3. Estamos utilizando o docker-compose para criar o servidor de banco de dados utilize `sudo docker-compose up -d` para criar a imagem e executar o container. 
4. Agora basta criar o container da aplicação também com o Docker `sudo docker run -it --rm --add-host=host.docker.internal:host-gateway -p 5000:5000 -e PORT=5000 -e DBPORT=5433 -e DBUSER=postgres -e DATABASE=coodesh_challenge -e DBHOST=host.docker.internal -e DBPASSWORD=123 nodejs-api`. Repare que as variáveis de ambiente são passadas junto com o comando.