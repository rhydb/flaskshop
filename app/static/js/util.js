export const notificationTypes = {
    SUCCESS: "good",
    ERROR: "bad",
}

export const pushNotification = (text, type) => {
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

export const errorMessage = (error) => {
    pushNotification("An error occured!", notificationTypes.ERROR);
    console.error(error);
}

export const formatNumber = (n) => {
    // format a number with commas (1234 => 1,234)
    return n.toString().split("").reverse().reduce((acc, x, i, arr) => {
        if (i != arr.length - 1 && (i + 1) % 3 == 0) {
            x = "," + x;
        }
        return x + acc;
    }, "");
}

export const addRainbow = () => {
    const rainbow = document.getElementById("rainbow")
    rainbow.style.position = "absolute";
    let hue = 0;
    let top = 0;
    let left = 0;
    let dx = 1;
    let dy = 1;
    const width = rainbow.getBoundingClientRect().width;
    const height = rainbow.getBoundingClientRect().height;
    setInterval(() => {
        hue = (hue + 1) % 360;
        rainbow.style.color = `hsl(${hue}, 50%, 50%)`;
        rainbow.style.top = `${top}px`;
        rainbow.style.left = `${left}px`;
        
        const nextTop = top + dy;
        if (nextTop + height > window.innerHeight || nextTop < 0) {
            dy *= -1;
        }
        top += dy;

        const nextLeft = left + dx;
        if (nextLeft + width > window.innerWidth || nextLeft < 0) {
            dx *= -1;
        }
        left += dx;
    }, 1);
}