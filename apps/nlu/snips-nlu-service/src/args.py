import argparse


def getargs():
    parser = argparse.ArgumentParser(description="Train or start REST service")

    subparsers = parser.add_subparsers(dest="start_option")
    subparsers.required = True

    train_parser = subparsers.add_parser(
        'train')
    train_parser.add_argument(
        '--dataset',
            type=str,
            required=True,
            help="dataset path")
    train_parser.add_argument(
        '--dataset-type',
            choices=['json', 'files'],
            default="files")
    train_parser.add_argument(
        '--train-persist-location',
            type=str,
            required=True,
            help="training persist location path")

    rest_parser = subparsers.add_parser(
        'rest-service',
            aliases=["rest"])
    rest_parser.add_argument(
        '--train-persist-location',
            type=str,
            required=True,
            help="training persist location path")
    rest_parser.add_argument(
        '--endpoint',
            type=str,
            default="nlu")

    return parser.parse_args();
