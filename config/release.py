import os

USERNAME = os.environ["username"]
PASSWORD = os.environ["password"]
DATABASE = os.environ["database"]

DEBUG = False
SECRET_KEY = os.environ["secretkey"]
SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{USERNAME}:{PASSWORD}@csmysql.cs.cf.ac.uk:3306/{DATABASE}"
