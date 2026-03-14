# Base
FROM python:3.11-alpine AS base
WORKDIR /app/apps/backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependências
FROM base AS deps
RUN apk add --no-cache libpq-dev gcc musl-dev
COPY apps/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime
FROM base AS runner
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
RUN apk add --no-cache libpq
WORKDIR /app
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
ENV PORT=8000
EXPOSE ${PORT}
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
