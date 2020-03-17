import sys, os
from minio import ResponseError

sys.path.insert(0, 'src')

from storage import get_storage_data, build_minio_client

storage_data = get_storage_data(os.getenv("STORAGE_DATASET"))
minio_client = build_minio_client(storage_data)

bucket = storage_data["bucket"]

objects = minio_client.list_objects_v2(bucket, recursive=True)

objects = list(map(lambda obj: obj.object_name, objects))

# print(objects)

try:
    for del_err in minio_client.remove_objects(bucket, objects):
        print("Deletion Error: {}".format(del_err))
except ResponseError as err:
    print(err)
