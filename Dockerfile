FROM alekzonder/puppeteer:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./ /usr/src/app/
RUN npm install --only=production

# Bundle app source
COPY ./ /usr/src/app

#RUN adduser -D app && chown -R app /usr/src/app

EXPOSE 3333
CMD [ "npm", "start" ]