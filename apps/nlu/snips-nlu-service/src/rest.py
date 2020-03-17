from flask import Flask, request
from snips_nlu import SnipsNLUEngine


def app(train_directory="data/train", endpoint="nlu"):

    nlu_engine = SnipsNLUEngine.from_path(train_directory)

    app = Flask(__name__)

    @app.route(f"/{endpoint}", methods=["GET", "POST"])
    def nlu():
        if request.method == "GET":
            text = request.args.get("text")
            lang = request.args.get("language", "en")
        elif request.method == "POST":
            if request.mimetype != 'application/json':
                return ('', 400)
            data = request.get_json()
            text = data.get("text")
            lang = data.get("language", "en")

        if text is None:
            return ('', 400)
        return nlu_engine.parse(text)

    return app
