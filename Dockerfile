FROM node:16-alpine as builder

# RUN mkdir -p /napa && chown -R node:node /napa
WORKDIR /napa
COPY package*.json ./
# COPY .env .

RUN npm config set unsafe-perm true
RUN npm install typescript
RUN npm install ts-node
# USER node
RUN npm install

COPY . . 
RUN npm run build


EXPOSE 8001
CMD [ "node", "./dist/index.js" ]
