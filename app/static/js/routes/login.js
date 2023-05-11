export const loginPage = () => {
    addInputValidation("login-username", (validator) => {
        validator
            .validate("Required", value => value.length > 0)
    });
    addInputValidation("login-password", (validator) => {
        validator.validate("Required", value => value.length > 0);
    });
}
