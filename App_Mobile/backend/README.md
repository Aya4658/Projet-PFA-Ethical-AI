# Backend API

This backend exposes a small HTTP API used by the Flutter app.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill `MONGODB_URI` with your MongoDB Atlas connection string.
3. Install dependencies:

```bash
npm install
```

4. Start server:

```bash
npm start
```

The API runs on `http://localhost:3000` by default.

## Main Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/:id`
- `PATCH /api/users/:id/preferences`
- `POST /api/users/:id/favorites`
- `DELETE /api/users/:id/favorites/:productId`
- `POST /api/users/:id/scans`
- `GET /api/products`
- `GET /api/products/:id`
