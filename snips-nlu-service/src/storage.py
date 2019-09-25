import os, json, shutil, re
from minio import Minio
from minio.error import (ResponseError, BucketAlreadyOwnedByYou,
                         BucketAlreadyExists)


def clean_data_directory():
    if os.path.exists("data"):
        shutil.rmtree("data")


def get_storage_data(storage_name):
    return {
        "type": os.getenv(f"{storage_name}_TYPE"),
        "endpoint": os.getenv(f"{storage_name}_ENDPOINT"),
        "access_key": os.getenv(f"{storage_name}_ACCESS_KEY"),
        "secret_key": os.getenv(f"{storage_name}_SECRET_KEY"),
        "secure": os.getenv(f"{storage_name}_SECURE") == "True",
        "bucket": os.getenv(f"{storage_name}_BUCKET")
    }


def build_minio_client(storage_data):
    return Minio(storage_data["endpoint"],
                 access_key=storage_data["access_key"],
                 secret_key=storage_data["secret_key"],
                 secure=storage_data["secure"])


def minio_download_json(minio_client, bucket, path):
    data = minio_client.get_object(bucket, path)
    return json.loads(data.read())


def clean_intents(intents):
    clean_intents = {}
    for key in intents.keys():
        if (len(intents[key]["utterances"]) > 0):
            intents[key]["utterances"] = clean_utterance_entities(intents[key]["utterances"])
            clean_intents[key] = intents[key]
    return clean_intents


def clean_utterance_entities(utterances):
    for utterance in utterances:
        for item in utterance.get("data"):
            if item.get("slotName") is not None and item.get("slot_name") is None:
                item["slot_name"] = item["slotName"]
            elif item.get("entity") is not None and item.get("slot_name") is None:
                item["slot_name"] = item["entity"]
    return utterances


def minio_download_dataset(minio_client, bucket, path, type):
    if path.endswith("/"):
        path = path[:-1]

    if type == "json":
        minio_client.fget_object(bucket, path, "data/dataset.json")

    elif type == "files":
        dataset = dict()

        dataset.update(minio_download_json(minio_client, bucket, path + "/info.json"))

        intents_objects = minio_client.list_objects_v2(bucket, prefix=path+"/intents", recursive=True)
        entities_objects = minio_client.list_objects_v2(bucket, prefix=path+"/entities", recursive=True)

        if intents_objects is None:
            intents_objects = []
        if entities_objects is None:
            entities_objects = []

        intents = minio_download_json_objects(minio_client, bucket, get_object_names(intents_objects))
        entities = minio_download_json_objects(minio_client, bucket, get_object_names(entities_objects))
        system_entities = minio_download_json(minio_client, bucket, path+"/system-entities.json")

        print(json.dumps(intents, indent=4))

        intents = clean_intents(intents)

        print(json.dumps(intents, indent=4))

        entities = add_system_entites_to_entities(system_entities, entities)

        dataset["intents"] = intents
        dataset["entities"] = entities

        dump_dataset(dataset)

    else:
        raise Exception("Not valid dataset type")


def dump_dataset(dataset):
    if not os.path.exists("data"):
        os.makedirs("data")
    with open("data/dataset.json", "w") as outfile:
        json.dump(dataset, outfile)

# Downloads json objects
# Returns dictionary, key = file name, value = json object
def minio_download_json_objects(minio_client, bucket, object_names):
    d = dict()
    for object_name in object_names:
        if not object_name.endswith(".json"):
            continue
        name = object_name.split("/")[-1][:-5] # Get file name with no extension
        d[name] = minio_download_json(minio_client, bucket, object_name)
    return d


def add_system_entites_to_entities(system_entities, entities_dict):
    for system_entity in system_entities:
        if system_entity["enabled"] is True:
            entities_dict[system_entity["name"]] = {}
    return entities_dict


def minio_upload_training(minio_client, bucket, path, zipfilePath):
    return minio_client.fput_object(bucket, path, zipfilePath, content_type="application/zip")


def minio_download_training(minio_client, bucket, path, zipfilePath):
    return minio_client.fget_object(bucket, path, zipfilePath)


def zip(path, out_path):
    shutil.make_archive(path, "zip", out_path)


def unzip(path, extract_dir):
    shutil.unpack_archive(path, extract_dir)


def get_object_names(objects):
    return list(map(lambda obj: obj.object_name, objects))
