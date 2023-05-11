import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate

ENV = "release"

app = Flask(__name__)
cfg = os.path.join(os.getcwd(), "config", ENV + ".py")
app.config.from_pyfile(cfg)

db = SQLAlchemy(app)
lm = LoginManager(app)
migrate = Migrate(app, db)

from .main import main as main_blueprint

app.register_blueprint(main_blueprint)

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
    migrate.init_app(app, db)

    from .main import main as main_blueprint

    app.register_blueprint(main_blueprint)

    return app
