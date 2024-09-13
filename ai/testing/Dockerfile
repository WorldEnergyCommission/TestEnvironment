# use the latest sinergym image as base image
FROM sailugr/sinergym:latest

# create the directory structure in the Dockerfile
RUN mkdir -p /efficientIO/ai/testing
WORKDIR /efficientIO/ai/testing

# install additional Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# copy the remaining files to that folder
COPY . .

# start a notebook server on the Dockerfile
EXPOSE 8888
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--NotebookApp.token=''", "--NotebookApp.password=''"]
