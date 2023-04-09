from flask_login import current_user, login_user, logout_user
from ..models import User, Product
from . import main
from .. import db
from flask import flash, jsonify, redirect, render_template, session, url_for, request
from .setup import tractor_items


@main.route("/products/<int:productid>")
def product(productid):
    product = db.get_or_404(Product, productid)
    return render_template("product.html", product=product)


@main.route("/")
@main.route("/products/")
def index():
    sorts = {
        "az": ("Name A-Z", Product.name),
        "za": ("Name Z-A", Product.name.desc()),
        "lowhigh": ("Price low to high", Product.price),
        "highlow": ("Price high to low", Product.price.desc()),
        "emissions": ("Emissions low to high", Product.emissions),
        "emissionsdesc": ("Emissions high to low", Product.emissions.desc()),
    }

    search = request.args.get("search", "")
    sortKey = request.args.get("sortBy")
    if sortKey not in sorts:
        sortKey = "az"
    sort = sorts[sortKey]

    products = db.session.execute(
        db.select(Product)
        .filter(Product.name.like("%" + search + "%"))
        .order_by(sort[1])
    ).scalars()
    return render_template(
        "index.html",
        products=products,
        sorts=sorts.items(),
        selected=sortKey,
        search=search,
    )


@main.route("/setup")
def setup():
    for product in tractor_items:
        db.session.add(product)
    db.session.commit()
    return redirect(url_for("main.index"))


@main.get("/register")
def register():
    return render_template("register.html")


@main.post("/register")
def register_post():
    username = request.form.get("username")
    password = request.form.get("password")
    password_confirm = request.form.get("password-confirm")

    def data_is_valid() -> bool:
        if not (username and password and password_confirm):
            flash("Username and password are required")
            return False
        if password != password_confirm:
            flash("Passwords do not match")
            return False

        username_exists = db.session.execute(
            db.select(User).where(User.username == request.form["username"])
        ).scalar()
        if username_exists:
            flash("An account with that username already exists")
            return False
        return True

    if not data_is_valid():
        return render_template("main.register")

    user = User.register(username, password)
    login_user(user)
    return redirect(url_for("main.index"))


@main.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = db.session.execute(
            db.select(User).where(User.username == request.form["username"])
        ).scalar()
        if user and User.verify_password(request.form["password"], user.password_hash):
            login_user(user)
            return redirect(request.args.get("next") or url_for("main.index"))

        flash("Invalid username or password")
    return render_template("login.html")

@main.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("main.index"))

@main.post("/basket")
def basket_post():
    json = request.get_json()
    if not json:
        return jsonify({"msg": "Invalid request", "error": 1})


    product_id = json["product"]
    session.setdefault("basket", {});
    session["basket"][str(product_id)] = session["basket"].get(str(product_id), 0) + 1
    session.modified = True

    return jsonify({"error": 0})

@main.get("/basket")
def basket_get():
    session.setdefault("basket", {});
    return jsonify(session["basket"])
