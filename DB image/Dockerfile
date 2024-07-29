FROM mysql:8.0-debian
COPY ["Main DB.sql", "/docker-entrypoint-initdb.d/Main DB.sql"]
ENV MYSQL_ROOT_PASSWORD=0000
ENV MYSQL_DATABASE=Social-Media
EXPOSE 3306

