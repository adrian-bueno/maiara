FROM python:3.8.10

RUN apt-get update && apt-get install -y libev-dev && apt-get clean

RUN pip install --no-cache-dir pipenv

WORKDIR /usr/src/app

COPY Pipfile* ./
RUN pipenv install --deploy --ignore-pipfile

RUN pipenv run download_resource de
RUN pipenv run download_resource en
RUN pipenv run download_resource es
RUN pipenv run download_resource fr
RUN pipenv run download_resource it
RUN pipenv run download_resource ja
RUN pipenv run download_resource ko
RUN pipenv run download_resource pt_br
RUN pipenv run download_resource pt_pt

COPY . .

EXPOSE 5000

CMD ["pipenv", "run", "start"]
