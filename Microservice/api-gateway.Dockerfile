# Basis-Image mit Python
FROM python:3.10-slim

WORKDIR /app



RUN pip install --no-cache-dir fastapi uvicorn httpx

COPY api-gateway.py .

EXPOSE 8080

CMD ["python", "api-gateway.py"]