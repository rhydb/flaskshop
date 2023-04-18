basket = {
    products: {},
    total: 0,
}

const basketCount = (product) => basket.products[product] ?? 0;

const sendAddToBasket = async (product) => {
    return fetch("/basket", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ product })
    })
        .then(response => response.json())
}

const sendRemoveFromBasket = async (product) => {
    return fetch("/basket", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ product })
    })
        .then(response => response.json())
}


const notificationTypes = {
    SUCCESS: "good",
    ERROR: "bad",
}

const pushNotification = (text, type) => {
    // add a notification to the screen and remove it after 2s or when clicked
    const notification = document.createElement("div");
    notification.innerText = text;
    notification.classList.add("notification");
    notification.classList.add(type);
    notification.onclick = () => {
        notification.style.animation = "slide-out 0.2s forwards";
        setTimeout(() => notification.remove(), 200);
    }
    document.getElementById("notification-wrapper").prepend(notification);
    
    setTimeout(() => notification.click(), 2000);
}

const modifyBasketCount = (sendModify, product, n) => {
    // modify the basket count of product by n usinig sendModify to send the request
    // and return the promise passing the updated count
    return sendModify(product).then(data => {
        if (data.error) {
            errorMessage(data.msg);
            return;
        }

        basket.total = data.total;
        const totalElement = document.getElementById("total");
        totalElement.innerText = `£${basket.total}`;

        const newCount = basketCount(product) + n;
        basket.products[product] = newCount;

        return newCount;
    })
}

const decrementBasket = (event, product) => {
    const [addToBasketBtn] = event.target.parentElement.getElementsByClassName("btn-addtobasket");
    const [incrementButton] = event.target.parentElement.getElementsByClassName("btn-incrementbasket");

    return modifyBasketCount(sendRemoveFromBasket, product, -1).then(newCount => {
        if (newCount === 0) {
            // reset the button back and remove the increment/decrement buttons
            addToBasketBtn.innerText = "Add to basket";
            event.target.remove();
            incrementButton.remove();

            delete basket.products[product];
        } else {
            addToBasketBtn.innerText = `${newCount} in basket`;
        }
        return newCount;
    })
}

const incrementBasket = (event, product) => {
    const [addToBasketBtn] = event.target.parentElement.getElementsByClassName("btn-addtobasket");
    return modifyBasketCount(sendAddToBasket, product, 1).then(newCount => {
        addToBasketBtn.innerText = `${newCount} in basket`;
        return newCount;
    })
}

// functions to generate the IDs used in the HTML for specific things
// using these functions reduces room for error like typos!
const checkoutSummaryItemId = (product) => `product-summary-${product}`;
const checkoutProductId = (product) => `product-${product}`;

const decrementCheckoutBasket = (event, product) => {
    decrementBasket(event, product).then(newCount => {
        const productSummary = document.getElementById(checkoutSummaryItemId(product));
        if (newCount === 0) {
            const productElement = document.getElementById(checkoutProductId(product));
            productElement.remove();
            productSummary.remove();

            const basketCount = document.getElementById("basket-count");
            basketCount.innerText = Object.keys(basket.products).length;

            disablePayBtnWhenBasketEmpty();
            return;
        }

        const [itemCount] = productSummary.getElementsByClassName("item-count");
        itemCount.innerText = newCount;
    })
}

const incrementCheckoutBasket = (event, product) => {
    incrementBasket(event, product).then(newCount => {
        const productSummary = document.getElementById(checkoutSummaryItemId(product));
        const [itemCount] = productSummary.getElementsByClassName("item-count");
        console.log(itemCount);
        itemCount.innerText = newCount;
    });
}


const createCheckoutSummaryItem = (product, name, price) => {
    const summaries = document.getElementById("summaries");
    const summaryItem = document.createElement("div");
    summaryItem.id = checkoutSummaryItemId(product);
    summaryItem.classList.add("summary-item");

    const nameElement = document.createElement("div");
    nameElement.classList.add("item-name");
    nameElement.innerText = `${name} x`;
    const countElement = document.createElement("span");
    countElement.classList.add("item-count");
    countElement.innerText = "1";
    nameElement.append(countElement);
    summaryItem.append(nameElement);

    const priceElement = document.createElement("div");
    priceElement.classList.add("item-price");
    priceElement.innerText = `£${price}`;
    summaryItem.append(priceElement);

    summaries.append(summaryItem);
}

const createBasketButtons = (btn, product) => {
    // add +/- buttons either side of the add to basket button
    const decrement = document.createElement("button");
    decrement.classList.add("btn", "btn-decrementbasket");
    btn.insertAdjacentElement("beforebegin", decrement);

    const increment = document.createElement("button");
    increment.classList.add("btn", "btn-incrementbasket");
    btn.insertAdjacentElement("afterend", increment);

    decrement.onclick = (event) => { decrementBasket(event, product) };
    increment.onclick = (event) => { incrementBasket(event, product) };
}

const errorMessage = (error) => {
    pushNotification("An error occured!", notificationTypes.ERROR);
    console.error(error);
}

const addToBasket = (event, product) => {
    if (basketCount(product) > 0) {
        // the user must use the increment/decrement buttons
        return;
    } 

    return modifyBasketCount(sendAddToBasket, product, 1).then(newCount => {
        event.target.innerText = `${newCount} in basket`;
        // add the - + basket buttons
        createBasketButtons(event.target, product);
        event.target.innerText = "1 in basket";
        pushNotification("Added to basket", notificationTypes.SUCCESS);
        return newCount;
    });
}

const formatNumber = (n) => {
    // format a number with commas (1234 => 1,234)
    return n.toString().split("").reverse().reduce((acc, x, i, arr) => {
        if (i != arr.length - 1 && (i + 1) % 3 == 0) {
            x = "," + x;
        }
        return x + acc;
    }, "");
}

const addInputValidation = (id, validate, errorid) => {
    const inputElement = document.getElementById(id);
    const errorElement = document.getElementById(errorid ?? `${id}-error`);
    const form = inputElement.form;
    const submitButton = form.querySelector("[type=submit]");
    submitButton.disabled = true;

    inputElement.addEventListener("input", () => {
        errorElement.innerText = "";
        let validator = new Validator(inputElement.value);
        validate(validator);
        if (validator.error) {
            errorElement.innerText = validator.error;
            inputElement.classList.remove("good")
            inputElement.classList.add("bad");
            submitButton.disabled = true;
        } else {
            inputElement.classList.remove("bad")
            inputElement.classList.add("good");

            // re-enable the button if all other input elements are also valid
            let isFormInvalid = false;
            for (let input of form.getElementsByTagName("input")) {
                if (!input.classList.contains("good")) {
                    isFormInvalid = true;
                    break;
                }
            }
            submitButton.disabled = isFormInvalid;
        }
    })
}

const registerPage = () => {
    addInputValidation("register-username", (validator) => {
        validator.validate("Username must be at least 3 characters long",
            value => value.length < 3);
    })

    addInputValidation("register-password", (validator) => {
        validator.validate("Password must be at least 6 characters long",
            value => value.length < 6)
    })

    addInputValidation("register-password-confirm", (validator) => {
        const password = document.getElementById("register-password").value;
        validator.validate("Passwords must match", value => password === value)
    })
}

const loginPage = () => {
    addInputValidation("login-username", (validator) => {
        validator
            .validate("Required", value => value.length > 0)
            .validate("Username cannot be more than 16 characters", value => value.length < 16)
    });
    addInputValidation("login-password", (validator) => {
        validator.validate("Required", value => value.length > 0);
    });
}

const indexPage = () => {
    const resultCount = document.getElementById("result-count");
    const resultWrapper = document.getElementById("result-wrapper");
    resultCount.innerText = resultWrapper.children.length;
}


const fetchBasket = async () => {
    return fetch('/basket')
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                errorMessage(data.message);
                return;
            }

            basket = data;
            console.log(basket)
        })
        .catch(errorMessage);
}

const disablePayBtnWhenBasketEmpty = () => {
    if (basket.total === 0) {
        console.log(basket.total)
        const payBtn = document.getElementById("btn-pay");
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.classList.add("disabled")
        }
    }
}

class Validator {
    constructor(data) {
        this.data = data;
        this.error = "";
    }

    validate(msg, callback) {
        if (this.error) {
            return this;
        }

        const valid = callback(this.data);
        if (!valid) {
            this.error = msg;
        }
        
        return this;
    }
}

const payPage = () => {
    addInputValidation("pay-ccn", (validator) => {
        validator
            .validate("Required", value => value.length > 0)
            .validate("Can only contain digits, spaces, and dashes", value => !value.match(/[^\d \-]/))
            .validate("Must be 16 digits", value => value.replaceAll(/[^\d]/g, "").length === 16);
    });

    const isInt = str => /^\d+$/.test(str);
    const expiryErrorId = "pay-expiry-error";
    
    // functions for validatnig that the expiry date is not in the past
    // using the year, month, and both
    const expiryNotInPastMsg = "Expiry cannot be in the past";
    const validateExpiryNotInPast = () => {
        const yearInput = document.getElementById("pay-expiry-year");
        const year = parseInt(yearInput.value);

        const monthInput = document.getElementById("pay-expiry-month");
        const month = parseInt(monthInput.value);

        const today = new Date();

        const isNotInPast = (() => {
            if (year === today.getFullYear()) {
                return month > today.getMonth() + 1;
            }
            return year > today.getFullYear();
        })();

        if (isNotInPast) {
            monthInput.classList.remove("bad");
            yearInput.classList.remove("bad")
            monthInput.classList.add("good");
            yearInput.classList.add("good")
        }

        return isNotInPast;
    };

    addInputValidation("pay-expiry-month", (validator) => {
       validator 
            .validate("Required", value => value.length > 0)
            .validate("Can only be digits", isInt)
            .validate("Must be valid month", month => parseInt(month) > 0 && parseInt(month) < 13)
            .validate(expiryNotInPastMsg, validateExpiryNotInPast)
    }, expiryErrorId)

    addInputValidation("pay-expiry-year", (validator) => {
        validator
            .validate("Required", value => value.length > 0)
            .validate("Can only be digits", isInt)
            .validate(expiryNotInPastMsg, validateExpiryNotInPast)
    }, expiryErrorId);
}

document.addEventListener("DOMContentLoaded", () => {
    // maps URL to the function that should be called
    
    const funcs = {
        "/register": registerPage,
        "/login": loginPage,
        "/": indexPage,
        "/products/": indexPage,
        "/checkout": disablePayBtnWhenBasketEmpty,
        "/pay": payPage,
    }

    fetchBasket().then(() => {
        if (funcs[location.pathname]) {
            funcs[location.pathname]();
        }
    });
})
