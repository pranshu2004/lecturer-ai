FROM python:3.9-slim
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r /code/requirements.txt
COPY ./app /code/app
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT