FROM python:3.9-slim


WORKDIR /app


RUN pip install --no-cache-dir fastapi uvicorn


COPY . .


EXPOSE 5002


CMD ["python", "app_review.py"]
