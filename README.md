# DoctPro Frontend

React + Vite frontend for DoctPro.

## Production deployment

### 1) Environment configuration
Use `.env.production` or your hosting provider's secret manager. See `.env.example`.

Required:
- `VITE_API_BASE_URL_BACKEND` (base URL of the backend API)

### 2) Build
```bash
npm ci
npm run build
```
Build output is in `dist/`.

### 3) Deployment options

Option A: Static hosting
- Upload `dist/` to any static host (Nginx, S3 + CloudFront, Vercel, Netlify).
- Ensure SPA routing falls back to `index.html`.

Example Nginx config:
```nginx
location / {
  try_files $uri /index.html;
}
```

Option B: Docker build (Nginx)
Create a Dockerfile like this:
```Dockerfile
# build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL_BACKEND
ENV VITE_API_BASE_URL_BACKEND=$VITE_API_BASE_URL_BACKEND
RUN npm run build

# serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
Build and run:
```bash
docker build -t doctpro-frontend --build-arg VITE_API_BASE_URL_BACKEND=https://api.example.com .
docker run -p 8080:80 doctpro-frontend
```

### 4) Local preview (optional)
```bash
npm run preview
```

## Notes
- If you deploy under a sub-path, update `base` in `vite.config.ts`.
- Ensure the backend allows the frontend domain via CORS.
