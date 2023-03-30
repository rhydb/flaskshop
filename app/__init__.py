from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
db = SQLAlchemy()

class Item:
    def __init__(self, id, image, name, shortdescription, description, emissions, price):
        self.image = image
        self.name = name
        self.shortdescription = shortdescription
        self.description = description
        self.emissions = emissions
        self.price = price
        self.id = id

items = []

from .main import routes