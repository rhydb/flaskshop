from config import secrets

DEBUG = False
SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{secrets.USERNAME}:{secrets.PASSWORD}@csmysql.cs.cf.ac.uk:3306/{secrets.DATABASE}"
