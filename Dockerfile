FROM ghcr.io/puppeteer/puppeteer:latest

USER root

RUN apt-get update && apt-get install sudo

RUN usermod -aG sudo pptruser \
    && adduser pptruser sudo \
    && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER pptruser

COPY . /app
RUN sudo chown -R pptruser:pptruser /app
WORKDIR /app


RUN yarn install \
    && yarn run build


CMD ["yarn", "run", "start"]
