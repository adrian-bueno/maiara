import os
import io
import json
from snips_nlu import SnipsNLUEngine
from snips_nlu.default_configs import (
        CONFIG_DE,
        CONFIG_EN,
        CONFIG_ES,
        CONFIG_FR,
        CONFIG_IT,
        CONFIG_JA,
        CONFIG_KO,
        CONFIG_PT_BR,
        CONFIG_PT_PT
    )


language_configs = {
    "de": CONFIG_DE,
    "en": CONFIG_EN,
    "es": CONFIG_ES,
    "fr": CONFIG_FR,
    "it": CONFIG_IT,
    "ja": CONFIG_JA,
    "ko": CONFIG_KO,
    "pt_br": CONFIG_PT_BR,
    "pt_pt": CONFIG_PT_PT
}


def train(dataset_file_path, train_directory):
    with io.open(dataset_file_path) as f:
        dataset = json.load(f)

    language = dataset.get("language", None)
    config = language_configs.get(language, None)
    if config is None:
        raise Exception(f"No language configuration for language {dataset.language}")

    nlu_engine = SnipsNLUEngine(config=config)
    nlu_engine.fit(dataset)
    nlu_engine.persist(train_directory)
