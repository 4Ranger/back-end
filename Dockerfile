FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV PORT=5000

ENV HOST=0.0.0.0

ENV JWT_SECRET=farras

ENV FIREBASE_API_KEY=AIzaSyCz9i-FX_AZe-W9Si7feeHCiTXTpd5dXq0

ENV GOOGLE_CLIENT_ID=1084746697990-u8caruh2c1dguijomjjvrc986vbmuug6.apps.googleusercontent.com

ENV GOOGLE_CLIENT_SECRET=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

ENV GOOGLE_REDIRECT_URL=http://localhost:5000/auth/google/callback

CMD [ "npm", "run", "start" ]