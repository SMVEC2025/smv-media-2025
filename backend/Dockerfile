FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy all backend files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Cloud Run sets PORT automatically
ENV PORT=8080

EXPOSE 8080

CMD ["bash", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT}"]
