FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g @expo/ngrok@^4.1.0
CMD ["npx", "expo", "start", "--tunnel"]