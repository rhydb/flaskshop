from flask_login import current_user, login_user, logout_user
from ..models import User, Product, Basket, BasketItem, Discount
from . import main
from .. import db
from flask import flash, jsonify, redirect, render_template, session, url_for, request
from .setup import tractor_items


def empty_session_basket():
    session["basket"] = {}
    session["total"] = 0

def get_active_basket():
    basket = current_user.baskets.filter(Basket.active).scalar()
    print("basket=", basket)
    return basket


@main.route("/products/<int:productid>")
def product(productid):
    product = db.get_or_404(Product, productid)
    session.setdefault("total", 0)
    return render_template("product.html", product=product, total=session["total"], basket=session.setdefault("basket", {}))


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

    print(f"{session.get('basket')=}")
    return render_template(
        "index.html",
        products=products,
        sorts=sorts.items(),
        selected=sortKey,
        search=search,
        total=session.setdefault("total", 0)
    )


@main.route("/setup")
def setup():
    for product in tractor_items:
        db.session.add(product)

    for code, discount in [("discount", 0.1), ("tractor", 0.5), ("free", 1.0)]:
        db.session.add(Discount(code=code, discount=discount))

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
        return redirect(url_for("main.register"))

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
            # load the active basket
            active_basket = get_active_basket()
            if active_basket:
                session["basket"] = {item.product_id: item.quantity for item in active_basket.items}
                session["total"] = sum(item.product.price for item in active_basket.items)
                session.modified = True
            return redirect(request.args.get("next") or url_for("main.index"))

        flash("Invalid username or password")
    return render_template("login.html")

@main.route("/logout")
def logout():
    logout_user()
    empty_session_basket()
    return redirect(url_for("main.index"))

@main.post("/basket")
def basket_post():
    # handle adding something to basket
    json = request.get_json()
    if not json:
        return jsonify({"msg": "Invalid request", "error": 1})

    product_id = str(json["product"])
    product = db.get_or_404(Product, product_id)

    session.setdefault("basket", {});
    session.setdefault("total", 0);

    session["basket"][str(product_id)] = session["basket"].get(str(product_id), 0) + 1
    session["total"] += product.price
    session.modified = True

    if current_user.is_authenticated:
        # update user's active basket
        active_basket = get_active_basket()
        if not active_basket:
            # does not have a basket, so make one
            active_basket = Basket(user_id=current_user.id)
            db.session.add(active_basket)

        # add the item to the basket
        print(f"{active_basket=}")
        basket_item = db.session.execute(db.select(BasketItem).where((BasketItem.basket_id == active_basket.id) & (BasketItem.product_id == product_id))).scalar()
        if not basket_item:
            basket_item = BasketItem(product_id=product_id, basket_id=active_basket.id)
            db.session.add(basket_item)
        else:
            basket_item.quantity = basket_item.quantity + 1

        db.session.commit()

    return jsonify({"error": 0, "total": session["total"]})

@main.delete("/basket")
def basket_delete():
    # handle removing or decrementing something from basket
    json = request.get_json()
    if not json:
        return jsonify({ "msg": "Invalid request", "error": 1 })

    product_id = str(json["product"])
    product = db.get_or_404(Product, int(product_id))

    if session["basket"].get(product_id):
        session["basket"][product_id] -= 1
        session["total"] -= product.price
        if session["basket"][product_id] <= 0:
            session["basket"].pop(product_id)
        session.modified = True


    if current_user.is_authenticated:
        # update user's active basket
        active_basket = get_active_basket()
        if not active_basket:
            # no active basket, should not happen!
            return jsonify({ "error": 1, "msg": "Could not remove item from basket" })

        basket_item = db.session.execute(db.select(BasketItem).where((BasketItem.basket_id == active_basket.id) & (BasketItem.product_id == product_id))).scalar()
        if not basket_item:
            # no basket item, should not happen!
            return jsonify({ "error": 1, "msg": "Could not remove item from basket" })
        basket_item.quantity -= 1
        if basket_item.quantity < 1:
            db.session.delete(basket_item)

        db.session.commit()

    return jsonify({ "error": 0, "total": session["total"] })

@main.get("/basket")
def basket_get():
    return jsonify({
        "products": session.setdefault("basket", {}),
        "total": session.setdefault("total", 0),
        "loggedin": current_user.is_authenticated,
    })

@main.route("/checkout")
def checkout():
    session.setdefault("basket", {})
    basketIds = [int(product_id) for product_id in session["basket"]]
    basket = list(db.session.execute(db.select(Product).where(Product.id.in_(basketIds))).scalars())
    return render_template("checkout.html", basket=basket, basket_count=session["basket"], total=session.setdefault("total", 0))

@main.get("/pay")
def pay():
    total = session.get("total", 0) * (1 - session.get("discount", 0))
    return render_template("pay.html", total=total)

@main.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")

@main.post("/pay")
def pay_post():
    if current_user.is_authenticated:
        # unmark the basket as active
        active_basket = get_active_basket()
        active_basket.active = False
        db.session.commit()
    empty_session_basket()
    return redirect(url_for("main.thankyou"))

@main.get("/discount/<code>")
def discount_get(code):
    discount = db.session.execute(db.select(Discount).where(Discount.code == code)).scalar()
    if not discount:
        return jsonify({ "error": 1, "message": "Invalid discount code" })

    percent = "%" + str(discount.discount * 100)
    total = session.get("total", 0)

    total *= 1.0 - discount.discount

    return jsonify({
        "message": "You saved " + percent,
        "discount": discount.discount,
        "total": total,
    })