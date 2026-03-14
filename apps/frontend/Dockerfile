FROM node:lts-alpine
WORKDIR /app/apps/frontend
COPY apps/frontend/package.json ./
RUN npm install
COPY apps/frontend ./
ENV PORT=3000
EXPOSE ${PORT}
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
