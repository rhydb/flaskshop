from ..models import User
from . import main
from flask import render_template

@main.route("/products/<int:itemid>")
def product(itemid):
    return render_template("item.html", item=item)

@main.route("/")
@main.route("/products/")
def index():
    return render_template("index.html", items=items)