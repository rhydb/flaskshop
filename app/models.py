from sqlalchemy.orm import backref, relationship
from flask_login import UserMixin
from . import db, lm
import hashlib
import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(16), index=True, unique=True)
    password_hash = db.Column(db.String(40)) # sha-1 hashes are 40 characters long

    basket_id = db.Column(db.Integer, db.ForeignKey("basket.id"), nullable=False)
    basket = db.relationship("Basket", backref="user", lazy=True, uselist=False)
    paid_baskets = db.relationship("PaidBasket", backref="user", lazy=True)

    def __init__(self, *args, **kwargs):
        if self.basket is None:
            self.basket = Basket()
            self.basket_id = self.basket.id
            db.session.add(self.basket)
        super().__init__(*args, **kwargs)

    def set_password(self, new_password):
        self.password_hash = User.hash_password(new_password)
        db.session.commit()

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
    long_desc = db.Column(db.String(1000))


class Basket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    items = db.relationship("BasketItem", backref="basket", lazy=True)

class PaidBasket(db.Model):
    id = db.Column(db.Integer, primary_key=True)    
    paid_total = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    basket_id = db.Column(db.Integer, db.ForeignKey("basket.id"), nullable=False)
    basket = db.relationship("Basket", backref="paidbasket", lazy=True, uselist=False)

class BasketItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    product = db.relationship("Product", backref="basketitem", lazy=True, uselist=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    basket_id = db.Column(db.Integer, db.ForeignKey("basket.id"), nullable=False)

class Discount(db.Model):
    code = db.Column(db.String(10), primary_key=True)
    discount = db.Column(db.Float, nullable=False, default=0.1)
