build:
    docker build -d tgbot .

run:
    docker run -d -p 3000:3000 --name tgbot --rm bot
