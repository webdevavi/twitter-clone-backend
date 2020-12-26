import { FieldError } from "../utils/FieldError";

export class QuackValidator {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  validate() {
    const errors: FieldError[] = [];
    if (this.text.length === 0) {
      errors.push({ field: "text", message: "The text must not be null." });
    } else if (this.text.length > 280) {
      errors.push({
        field: "text",
        message: "The text must not be more than 280 characters long.",
      });
    }

    return errors;
  }
}
