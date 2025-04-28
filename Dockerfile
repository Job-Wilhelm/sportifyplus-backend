# 使用官方輕量版 Node.js
FROM node:22-alpine3.20

# 設定工作目錄
WORKDIR /app

# 預先複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝 production dependencies
RUN npm install --production

# 複製其他所有檔案
COPY . .

# 預設暴露的 port（但由 docker-compose 決定最終 port）
EXPOSE 8080

# 啟動指令
CMD ["node", "bin/www.js"]