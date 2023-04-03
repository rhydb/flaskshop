import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

app = Flask(__name__)
db = SQLAlchemy()
lm = LoginManager()


class Item:
    def __init__(
        self, id, image, name, shortdescription, description, emissions, price
    ):
        self.image = image
        self.name = name
        self.shortdescription = shortdescription
        self.description = description
        self.emissions = emissions
        self.price = price
        self.id = id


def create_app(config_name):
    app = Flask(__name__)

    # import configuration
    cfg = os.path.join(os.getcwd(), "config", config_name + ".py")
    app.config.from_pyfile(cfg)

    db.init_app(app)
    lm.init_app(app)

    from .main import main as main_blueprint

    app.register_blueprint(main_blueprint)

    return app
