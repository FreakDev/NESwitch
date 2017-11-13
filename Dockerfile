FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

RUN npm install pm2 -g

VOLUME [ "public", "src", "server" ]

COPY pm2-app.json pm2-app.json

EXPOSE 3001

CMD ["pm2-docker", "start", "pm2-app.json"]