const basket = {}

const notificationTypes = {
    SUCCESS: "good",
    ERROR: "bad",
}

const pushNotification = (text, type) => {
    const notification = document.createElement("div");
    notification.innerText = text;
    notification.classList.add("notification");
    notification.classList.add(type);
    notification.onclick = () => {
        notification.style.animation = "slide-out 0.2s forwards";
        setTimeout(() => notification.remove(), 200);
    }
    document.getElementById("notification-wrapper").prepend(notification);
}

const addToBasket = (product) => {
    fetch('/basket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product })
    })
        .then(response => response.json())
        .then(data => {
            // update the count in local storage
            if (data.error) {
                pushNotification("An error occured!", notificationTypes.ERROR)
                console.error(data.message);
                return;
            }
            let count = Number.parseInt(localStorage.getItem(product) ?? 0) // the current count or 0 if it is not in the basket;
            localStorage.setItem(product, count + 1);
            pushNotification("Added to basket", notificationTypes.SUCCESS);

        })
        .catch(error => {
            console.error(error)
            pushNotification("An error occured", notificationTypes.ERROR);
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
    console.log(inputElement);
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
    console.log(resultWrapper.children, resultWrapper.children.length)
    resultCount.innerText = resultWrapper.children.length;
}

document.addEventListener("DOMContentLoaded", () => {
    // maps URL to the function that should be called
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
