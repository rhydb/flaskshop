import { Validator, addInputValidation } from "../validation.js"
import { setTotal, basket } from "../basket.js";

const applyDiscount = () => {
    const code = document.getElementById("discountCode");
    fetch(`/discount/${code.value}`)
        .then((res) => res.json())
        .then(res => {
            const discountResult = document.getElementById("discountResult");

            if (res.error) {
                code.classList.remove("good");
                code.classList.add("bad");
                discountResult.classList.remove("goodmsg");
                discountResult.classList.add("errormsg");
            } else {
                // discount worked
                code.classList.remove("bad");
                code.classList.add("good");
                discountResult.classList.remove("errormsg");
                discountResult.classList.add("goodmsg");
                basket.discountCode = code.value;
                setTotal(parseInt(res.total))
            }

            discountResult.innerText = res.message;
        })
}

export const payPage = () => {
    const discountBtn = document.getElementById("discountBtn");
    const discountCode = document.getElementById("discountCode");
    discountBtn.addEventListener("click", applyDiscount);
    discountCode.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            applyDiscount();
        }
    });

    addInputValidation("pay-name", (validator) => {
        validator
            .validate(...Validator.required)
            .validate("Can only contain letters, dashes and spaces", value => !value.match(/[^A-Za-z \-]/))
    })

    addInputValidation("pay-ccn", (validator) => {
        validator
            .validate(...Validator.required)
            .validate("Can only contain digits, spaces, and dashes", value => !value.match(/[^\d \-]/))
            .validate("Must be 16 digits", value => value.replaceAll(/[^\d]/g, "").length === 16);
    });

    const expiryErrorId = "pay-expiry-error";
    
    const validateExpiryNotInPast = [
        "Expiry cannot be in the past",
        () => {
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
        }
    ];

    const validateDigitsOnly = ["Can only be digits", value => /^\d+$/.test(value)];

    addInputValidation("pay-expiry-month", (validator) => {
       validator 
            .validate(...Validator.required)
            .validate(...validateDigitsOnly)
            .validate("Must be valid month", month => parseInt(month) > 0 && parseInt(month) < 13)
            .validate(...validateExpiryNotInPast)
    }, expiryErrorId)

    addInputValidation("pay-expiry-year", (validator) => {
        validator
            .validate(...Validator.required)
            .validate(...validateDigitsOnly)
            .validate(...validateExpiryNotInPast)
    }, expiryErrorId);

    addInputValidation("pay-cvv", (validator) => {
        validator
            .validate(...Validator.required)
            .validate(...validateDigitsOnly)
            .validate("Must be 3 digits", (value) => value.length === 3)
    })
}