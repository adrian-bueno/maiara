import os, glob, sys

sys.path.insert(0, 'src')

from storage import get_storage_data, build_minio_client


data_directory = "./test/data/"
data_directory_len = len(data_directory)

files_path = glob.glob(data_directory + "**/*", recursive=True)

object_names = list(map(lambda file_path: file_path[data_directory_len:], files_path))

upload_info = list(zip(files_path, object_names))

storage_data = get_storage_data(os.getenv("STORAGE_DATASET"))
minio_client = build_minio_client(storage_data)

bucket = storage_data["bucket"]

for info in upload_info:
    object_name = info[1]
    file_path = info[0]
    if (os.path.isfile(file_path)):
        print(f"Uploading {object_name}...")
        minio_client.fput_object(bucket, object_name, file_path)
