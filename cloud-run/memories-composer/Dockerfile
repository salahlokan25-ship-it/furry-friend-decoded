# Cloud Run container for memories-composer
FROM gcr.io/distroless/nodejs20-debian12

# Distroless needs node_modules built beforehand; use a builder stage
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY index.js ./

# Final image
FROM gcr.io/distroless/nodejs20-debian12
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app /app
# ffmpeg-static provides a binary; ensure it's available in PATH within distroless runtime
ENV PATH="/app/node_modules/.bin:${PATH}"
EXPOSE 8080
CMD ["/app/index.js"]
