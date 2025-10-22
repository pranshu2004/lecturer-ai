FROM python:3.9-slim

WORKDIR /code

# Copy only the requirements file first
COPY ./requirements.txt /code/requirements.txt

# Install the dependencies (torch is not needed for this test)
RUN pip install --no-cache-dir -r /code/requirements.txt

# Copy the rest of your application code
COPY ./app /code/app

# Use the PORT environment variable provided by Cloud Run
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

