FROM python:3.11.7-slim-bookworm
WORKDIR /code
RUN pip install --upgrade pip
RUN mkdir "Studies"
RUN mkdir "ai"
RUN apt-get update && apt-get install -y gcc libpq-dev liblapack-dev libblas-dev libsuitesparse-dev
COPY ai/requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY ai ai/
CMD ["python", "-u", "-m", "ai.execution.workers"]
