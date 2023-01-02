FROM node:14.18
WORKDIR /app
COPY package.json /app
RUN npm i -g @adonisjs/cli
RUN npm install
COPY . /app
RUN cd /app
EXPOSE 3333
CMD ["adonis", "serve", "--dev"]
