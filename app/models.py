from sqlalchemy.orm import backref, relationship
from flask_login import UserMixin
from . import db, lm
import hashlib

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(16), index=True, unique=True)
    password_hash = db.Column(db.String(40)) # sha-1 hashes are 40 characters long
    baskets = db.relationship("Basket", backref="user", lazy=True)

    @staticmethod
    def hash_password(password):
        return hashlib.sha1(password.encode()).hexdigest() 

    @staticmethod
    def verify_password(password, password_hash):
        return User.hash_password(password) == password_hash

    @staticmethod
    def register(username, password):
        user = User(username=username, password_hash=User.hash_password(password))
        db.session.add(user)
        db.session.commit()
        return user

@lm.user_loader
def load_user(id):
    return db.session.execute(db.select(User).where(User.id == int(id))).scalar()


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40))
    price = db.Column(db.Integer)
    emissions = db.Column(db.Integer)
    image = db.Column(db.String(50))
    short_desc = db.Column(db.String(50))
    long_desc = db.Column(db.String(150))


class Basket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    active = db.Column(db.Boolean, nullable=False, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    items = db.relationship("BasketItem", backref="basket", lazy=True)


class BasketItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    basket_id = db.Column(db.Integer, db.ForeignKey("basket.id"), nullable=False)
