import { Validator, addInputValidation } from "../validation.js";

export const registerPage = () => {
    addInputValidation("register-username", (validator) => {
        validator.validate("Username must be at least 3 characters long",
            value => value.length >= 3);
    })

    Validator.validatePasswords("register-password", "register-password-confirm", "register-password-error")
}
