FROM node:10.15-alpine

WORKDIR /mdt_web

RUN npm i -g @angular/cli@7.3.0
COPY package.json package.json
RUN npm install --silent

COPY . .

RUN cp ./bootstrap_theme/bootstrap.css ./node_modules/bootstrap/dist/css/bootstrap.css

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--disableHostCheck"]