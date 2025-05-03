# 使用官方輕量版 Node.js
FROM node:22-alpine3.20

# 宣告可傳入的 build-time 變數
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# 設定工作目錄
WORKDIR /app

# 預先複製 package.json 和 package-lock.json
COPY package*.json ./

# 依 NODE_ENV 決定安裝內容
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm install --omit=dev; \
    else \
      npm install; \
    fi


# 安裝 production dependencies 正式上線時使用

# RUN npm install --production

#安裝包含devDependencies的模組

# RUN npm install

# 複製其他所有檔案
COPY . .

# 預設暴露的 port（但由 docker-compose 決定最終 port）
EXPOSE 8080

# 啟動指令
CMD ["npm", "run", "dev"]