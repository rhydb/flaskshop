import { basket, decrementBasket } from "../basket.js";

// functions to generate the IDs used in the HTML for specific things
// using these functions reduces room for error like typos!
const checkoutSummaryItemId = (product) => `product-summary-${product}`;
const checkoutProductId = (product) => `product-${product}`;

export const disablePayBtnWhenBasketEmpty = () => {
    if (basket.total === 0) {
        const payBtn = document.getElementById("btn-pay");
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.classList.add("disabled")
        }
    }
}

window.decrementCheckoutBasket = (event, product) => {
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

window.incrementCheckoutBasket = (event, product) => {
    incrementBasket(event, product).then(newCount => {
        const productSummary = document.getElementById(checkoutSummaryItemId(product));
        const [itemCount] = productSummary.getElementsByClassName("item-count");
        itemCount.innerText = newCount;
    });
}


window.createCheckoutSummaryItem = (product, name, price) => {
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