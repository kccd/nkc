FROM node:8.9.4
RUN mkdir /root/app
RUN mkdir /root/app/nkc
RUN npm i npm@latest -g
WORKDIR /root/app/nkc
COPY ./package.json /root/app/nkc
RUN npm install && npm cache clean --force
COPY . /root/app/nkc
RUN npm install pm2 -g
CMD pm2 start pm2.config.js && pm2 log
EXPOSE 9000

