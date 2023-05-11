export class Validator {
    constructor(data) {
        this.data = data;
        this.error = "";
    }

    static required = ["Required", (value) => value.length > 0];

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


    static validatePasswords = (passwordId, confirmId, errorId) => {
        const validate = (validator) => {
            validator
                .validate("Password must be at least 6 characters long",
                    value => value.length >= 6)
                .validate("Passwords must match", () => {
                    const passwordInput = document.getElementById(passwordId);
                    const confirmInput = document.getElementById(confirmId);

                    const passwordsMatch = passwordInput.value === confirmInput.value;
                    if (passwordsMatch) {
                        passwordInput.classList.remove("bad");
                        confirmInput.classList.remove("bad")
                        passwordInput.classList.add("good");
                        confirmInput.classList.add("good")
                    }

                    return passwordsMatch;
                })
        }

        addInputValidation(passwordId, validate, errorId);
        addInputValidation(confirmId, validate, errorId);
    }
}

export const addInputValidation = (id, validate, errorid) => {
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
