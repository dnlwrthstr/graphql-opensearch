FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server/ ./server/

# Copy GraphQL schema
COPY graphql/schema.graphql ../graphql/schema.graphql

# Set the working directory to where the server code is
WORKDIR /app/server

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
