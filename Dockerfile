# FROM node:8.9-alpine
# ENV NODE_ENV production
# WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../
# COPY . .
# EXPOSE 5000
# CMD npm start

FROM node:latest
ENV NPM_CONFIG_LOGLEVEL warn

EXPOSE 5000

RUN apt-get update
RUN apt-get install -y runit

COPY . /src
RUN chown -R node:node /src

WORKDIR /src

USER node
RUN npm install

USER root
COPY services/ /etc/service/
RUN chmod +x /etc/service/*/run

ENTRYPOINT ["runsvdir"]
CMD ["/etc/service/"]
