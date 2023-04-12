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

    modifyBasketCount(sendRemoveFromBasket, product, -1).then(newCount => {
        if (newCount === 0) {
            // reset the button back and remove the increment/decrement buttons
            addToBasketBtn.innerText = "Add to basket";
            event.target.remove();
            incrementButton.remove();
        } else {
            addToBasketBtn.innerText = `${newCount} in basket`;
        }
    })
}

const incrementBasket = (event, product) => {
    const [addToBasketBtn] = event.target.parentElement.getElementsByClassName("btn-addtobasket");
    modifyBasketCount(sendAddToBasket, product, 1).then(newCount => {
        addToBasketBtn.innerText = `${newCount} in basket`;
    })
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

const addInputValidation = (id, validate) => {
    const inputElement = document.getElementById(id);
    const errorElement = document.getElementById(`${id}-error`);
    const form = inputElement.form;
    const submitButton = form.querySelector("[type=submit]");
    submitButton.disabled = true;

    inputElement.addEventListener("input", () => {
        errorElement.innerText = "";
        const error = validate(inputElement.value);
        if (error) {
            errorElement.innerText = error;
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
    addInputValidation("register-username", (value) => {
        if (value.length < 3) {
            return "Username must be at least 3 characters long";
        }
    })

    addInputValidation("register-password", (value) => {
        if (value.length < 6) {
            return "Password must be at least 6 characters long"
        }
    })

    addInputValidation("register-password-confirm", (value) => {
        const password = document.getElementById("register-password").value;
        if (password !== value) {
            return "Passwords do not match";
        }
    })
}

const loginPage = () => {
    const required = (value) => value.length > 0 ? null : "Required";
    addInputValidation("login-username", (value ) => {
        const requiredResult = required(value);
        if (requiredResult) {
            return requiredResult;
        }
        if (value.length > 16) {
            return "Username cannot be more than 16 characters"
        }
    });
    addInputValidation("login-password", required);
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

document.addEventListener("DOMContentLoaded", () => {
    // maps URL to the function that should be called
    
    fetchBasket();
    const funcs = {
        "/register": registerPage,
        "/login": loginPage,
        "/": indexPage,
        "/products/": indexPage,
    }

    if (funcs[location.pathname]) {
        funcs[location.pathname]();
    }
})
