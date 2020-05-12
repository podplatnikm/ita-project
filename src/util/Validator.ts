export default class Validator {
    static async validatePasswordStrength(password: string) {
        const minLength = 6;
        const maxLength = 20;
        return !(password.length < minLength || password.length > maxLength);
    }
}
