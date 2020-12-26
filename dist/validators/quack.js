"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuackValidator = void 0;
class QuackValidator {
    constructor(text) {
        this.text = text;
    }
    validate() {
        const errors = [];
        if (this.text.length === 0) {
            errors.push({ field: "text", message: "The text must not be null." });
        }
        else if (this.text.length > 280) {
            errors.push({
                field: "text",
                message: "The text must not be more than 280 characters long.",
            });
        }
        return errors;
    }
}
exports.QuackValidator = QuackValidator;
//# sourceMappingURL=quack.js.map