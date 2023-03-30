const addToCart = (item) => {
    let count = Number.parseInt(localStorage.getItem(item) ?? 0) // the current count or 0 if it is not in the basket;
    localStorage.setItem(item, count + 1);
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