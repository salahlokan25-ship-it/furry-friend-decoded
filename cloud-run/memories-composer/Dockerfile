# Build stage: install dependencies
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .

# Final stage: use full Node image (not slim or distroless)
FROM node:20-bookworm
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"

# ffmpeg needs shared libs; full image includes them
EXPOSE 8080
CMD ["node", "index.js"]



