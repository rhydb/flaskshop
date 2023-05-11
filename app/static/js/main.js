import { fetchBasket } from "./basket.js";
import { addRainbow } from "./util.js";

import { disablePayBtnWhenBasketEmpty } from "./routes/checkout.js";``
import { loginPage } from "./routes/login.js";
import { myAccountPage } from "./routes/myaccount.js";
import { payPage } from "./routes/pay.js";
import { registerPage } from "./routes/register.js";
import { indexPage } from "./routes/root.js";

document.addEventListener("DOMContentLoaded", () => {
    // maps URL to the function that should be called
    
    const funcs = {
        "/register": registerPage,
        "/login": loginPage,
        "/": indexPage,
        "/products/": indexPage,
        "/checkout": disablePayBtnWhenBasketEmpty,
        "/pay": payPage,
        "/thankyou": addRainbow,
        "/myaccount": myAccountPage,
    }

    fetchBasket().then(() => {
        if (funcs[location.pathname]) {
            funcs[location.pathname]();
        }
    });
})
