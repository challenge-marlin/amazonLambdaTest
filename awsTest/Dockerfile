FROM public.ecr.aws/lambda/nodejs:18

# アプリケーションの依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# Lambda関数のハンドラーを設定
CMD [ "lambda/getUser.handler" ] 