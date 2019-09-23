# Snips NLU service


## Min.io

```bash
docker run -it -p 9000:9000 \
  -v /home/adrian/minio/data:/data \
  -v /home/adrian/minio/config:/root/.minio \
  minio/minio server /data
```

###

JSON de ejemplo

```
pipenv run start train \
    --dataset sample_dataset.json \
    --dataset-type json \
    --train-persist-location sample_dataset_json_train.zip
```

```
pipenv run start rest-service --train-persist-location sample_dataset_json_train.zip
```

--------------

Con estructura de ficheros

```
pipenv run start train \
    --dataset skills/myskill/develop/en/dataset \
    --dataset-type files \
    --train-persist-location skills/myskill/develop/en/dataset/train.zip
```

```
pipenv run start rest-service --train-persist-location skills/myskill/develop/en/dataset/train.zip
```

---------------

Con estructura de ficheros y ejecutandose dentro de Docker

```
docker run -it --net=host maiara/snips-nlu-service \
    pipenv run start train \
    --dataset skills/myskill/develop/en/dataset \
    --dataset-type files --train-persist-location skills/myskill/develop/en/dataset/train.zip
```

```
docker run -it --net=host -p 5000:5000 maiara/snips-nlu-service \
    pipenv run start rest-service \
    --train-persist-location skills/myskill/develop/en/dataset/train.zip
```
