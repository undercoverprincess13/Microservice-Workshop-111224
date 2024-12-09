FROM python:3.9-slim


WORKDIR /app


RUN pip install --no-cache-dir fastapi uvicorn


COPY . .


EXPOSE 5001


CMD ["python", "app_product.py"]
