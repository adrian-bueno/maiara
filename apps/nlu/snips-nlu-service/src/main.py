import os
from args import getargs
import bjoern

from storage import (
    get_storage_data, build_minio_client, clean_data_directory,
    minio_download_dataset, minio_upload_training, minio_download_training,
    zip, unzip)
from rest import app
from train import train


def startRestService(train_persist_location, endpoint):
    storage_data_train = get_storage_data(os.getenv("STORAGE_TRAIN"))
    storage_train = build_minio_client(storage_data_train)
    minio_download_training(storage_train, storage_data_train["bucket"], train_persist_location, "data/train.zip")
    unzip("data/train.zip", "data/train")
    restapp = app(train_directory="data/train", endpoint=endpoint)
    host = os.getenv("HOST")
    if os.getenv("PORT") is None:
        port = 5000
    else:
        port = int(os.getenv("PORT"))
    bjoern.run(restapp, host, port)


def startTrain(dataset, dataset_type, train_persist_location):
    storage_data_dataset = get_storage_data(os.getenv("STORAGE_DATASET"))
    storage_dataset = build_minio_client(storage_data_dataset)
    minio_download_dataset(storage_dataset, storage_data_dataset["bucket"], dataset, dataset_type)
    train("data/dataset.json", "data/train")
    zip("data/train", "data/train")
    storage_data_train = get_storage_data(os.getenv("STORAGE_TRAIN"))
    storage_train = build_minio_client(storage_data_train)
    minio_upload_training(storage_dataset, storage_data_dataset["bucket"], train_persist_location, "data/train.zip")


if __name__ == "__main__":
    args = getargs()
    print(args)
    clean_data_directory()
    if args.start_option == "rest-service":
        startRestService(args.train_persist_location, args.endpoint)
    elif args.start_option == "train":
        startTrain(args.dataset, args.dataset_type, args.train_persist_location)
    else:
        raise Exception("Bad argument <start_option> {train, rest-service}")
