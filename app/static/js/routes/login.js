import { Validator, addInputValidation } from "../validation.js";

export const loginPage = () => {
    addInputValidation("login-username", (validator) => {
        validator
            .validate(...Validator.required)
    });
    addInputValidation("login-password", (validator) => {
        validator.validate(...Validator.required);
    });
}
