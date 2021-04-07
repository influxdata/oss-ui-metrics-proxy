FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY index.js ./

EXPOSE 3030

CMD ["node", "index.js"]
