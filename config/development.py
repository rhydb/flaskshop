import os

DEBUG = True
SECRET_KEY = 'secretkey'
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(os.path.dirname(__file__), "../data-dev.sqlite3")
