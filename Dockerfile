FROM node:20

WORKDIR /app

# सिर्फ package.json को कॉपी करो
COPY package.json ./

# यह कमांड अपने आप लॉकफाइल के बिना भी सब इंस्टॉल कर लेगी
RUN npm install

# बाकी सारा कोड कॉपी करो
COPY . .

# आपका पोर्ट (server.js में 3000 है)
EXPOSE 3000

# ऐप शुरू करने की कमांड
CMD ["node", "server.js"]
