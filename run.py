from app import app, db, lm
from app.models import Product, User

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        if User.query.filter_by(username="john").first() is None:
            User.register("john", "cat")
    app.run()
