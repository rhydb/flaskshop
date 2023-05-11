import { pushNotification, notificationTypes, errorMessage } from "./util.js";

export const basket = {
    products: {},
    total: 0,
    discountCode: "",
    showLossMessage: false,
}

const basketCount = (product) => basket.products[product] ?? 0;

export const setTotal = (total) => {
    basket.total = total;
    const totalElement = document.getElementById("total");
    if (totalElement) {
        totalElement.innerText = `£${total}`;
    }
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


export const addToBasket = (event, product) => {
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

        if (basket.showBasketLossMsg) {
            pushNotification("You are not logged in, basket will be lost after logging in or session end", notificationTypes.ERROR);
            basket.showBasketLossMsg = false;
        }

        return newCount;
    });
}

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



export const modifyBasketCount = (sendModify, product, n) => {
    // modify the basket count of product by n usinig sendModify to send the request
    // and return the promise passing the updated count
    return sendModify(product).then(data => {
        if (data.error) {
            errorMessage(data.msg);
            return;
        }

        setTotal(data.total)

        const newCount = basketCount(product) + n;
        basket.products[product] = newCount;

        return newCount;
    })
}

export const decrementBasket = (event, product) => {
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

export const incrementBasket = (event, product) => {
    const [addToBasketBtn] = event.target.parentElement.getElementsByClassName("btn-addtobasket");
    return modifyBasketCount(sendAddToBasket, product, 1).then(newCount => {
        addToBasketBtn.innerText = `${newCount} in basket`;
        return newCount;
    })
}

export const fetchBasket = async () => {
    return fetch('/basket')
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                errorMessage(data.message);
                return;
            }

            basket.showBasketLossMsg = !data.loggedin;
            basket.products = data.products;
            basket.total = data.total;
        })
        .catch(errorMessage);
}


window.addToBasket = addToBasket;
window.incrementBasket = incrementBasket;
window.decrementBasket = decrementBasket;