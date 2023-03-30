// format a number with commas, e.g. 1234 => 1,234
const formatNumber = (n) => {
    return n.toString().split("").reverse().reduce((acc, x, i) => {
        if (i != n.toString().length - 1 && (i + 1) % 3 == 0) {
            x = "," + x;
        }
        return x + acc;
    }, "");
}