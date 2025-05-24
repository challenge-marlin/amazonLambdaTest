FROM public.ecr.aws/lambda/nodejs:20 as builder

# 開発用の依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# プロダクション用の依存関係のみをインストール
FROM public.ecr.aws/lambda/nodejs:20
COPY --from=builder /var/task/node_modules ./node_modules
COPY . .

# Lambda関数のハンドラーは環境変数で設定可能に
CMD [ "/lambda/${LAMBDA_FUNCTION}/index.handler" ] 