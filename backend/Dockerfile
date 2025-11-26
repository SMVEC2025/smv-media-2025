FROM python:3.11-slim

# Create working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend folder into container
COPY backend ./backend

# Expose port FastAPI will run on
EXPOSE 8000

# Start the FastAPI backend (adjust entry file if needed)
# If your file is server.py, then use backend.server:app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
