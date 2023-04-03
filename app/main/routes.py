from flask_login import login_user
from ..models import User, Product
from . import main
from .. import db
from flask import flash, redirect, render_template, session, url_for, request


@main.route("/products/<int:productid>")
def product(productid):
    product = db.get_or_404(Product, productid)
    return render_template("product.html", product=product)


@main.route("/")
@main.route("/products/")
def index():
    products = db.session.execute(db.select(Product)).scalars()
    return render_template("index.html", products=products)


@main.route("/register", methods=["GET", "POST"])
def register():
    return render_template("register.html")


@main.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = db.session.execute(db.select(User).where(User.username == request.form["username"])).scalar()
        if user and User.verify_password(request.form["password"], user.password_hash):
            login_user(user)
            return redirect(request.args.get('next') or url_for('main.index'))

        flash("Invalid username or password")
    return render_template("login.html")
