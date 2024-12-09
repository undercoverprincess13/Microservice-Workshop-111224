FROM python:latest

# Arbeitsverzeichnis im Container setzten
WORKDIR /app

# Abhängigkeiten kopieren und installieren
RUN pip install --no-cache-dir fastapi uvicorn


# Kopiere den Rest des Codes ins Arbeitsverzeichnis
COPY . .

# Exponiere den Port, auf dem die App läuft
EXPOSE 8081

# Starte die Anwendung
CMD ["python", "server.py"]