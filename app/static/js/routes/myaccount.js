import { Validator } from "../validation.js"

export const myAccountPage = () => {
    Validator.validatePasswords("new-password", "new-password-confirm", "password-error")
}