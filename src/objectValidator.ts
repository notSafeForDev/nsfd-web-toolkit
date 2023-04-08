/**
 * Class for validating dynamic objects, such as objects created through a text editor by a user
 */
export class ObjectValidator {
    public static validate(object: any, schema: { [key: string]: any } | Object[] | string | Function, { tracePrefix = "" } = {}): string[] {
        if (typeof schema === "function") {
            let value = schema(object);

            if (typeof value === "object") {
                return this.validate(object, value, { tracePrefix });
            }

            if (typeof value === "string" && value !== "") {
                return [tracePrefix + " (" + object + ": " + typeof object + ") " + value];
            }

            return [];
        }

        if (typeof schema === "object" && !Array.isArray(schema)) {
            if (typeof object !== "object") {
                return [tracePrefix + " (" + object + ": " + typeof object + ") is not valid, expected: object"];
            }

            let errors: string[] = [];

            for (let key in schema) {
                let childSchema: any = schema[key];
                let isOptional = key.endsWith("?");
                key = isOptional ? key.substring(0, key.length - 1) : key;

                if (isOptional && object.hasOwnProperty(key) === false) {
                    continue;
                }

                let newTracePrefix: string = tracePrefix === "" ? key : tracePrefix + "." + key;
                let doesValueExist: boolean = object.hasOwnProperty(key);

                if (doesValueExist === false && isOptional === false) {
                    errors = [...errors, newTracePrefix + " is missing"];
                } else {
                    errors = [...errors, ...this.validate(object[key], childSchema, { tracePrefix: newTracePrefix })];
                }
            }

            return errors;
        }

        if (Array.isArray(schema)) {
            if (Array.isArray(object) === false) {
                return [tracePrefix + " (" + object + ": " + typeof object + ") is not valid, expected Array"];
            }

            let errors: string[] = [];

            for (let i = 0; i < object.length; i++) {
                let currentValueErrors: string[] = [];
                let isValid = false;
                for (let childSchema of schema) {
                    let schemaErrors = this.validate(object[i], childSchema, { tracePrefix: tracePrefix + "[" + i + "]" });
                    if (schemaErrors.length === 0) {
                        isValid = true;
                        break;
                    }
                    currentValueErrors = [...currentValueErrors, ...schemaErrors];
                }
                if (isValid === false) {
                    errors = [...errors, ...currentValueErrors];
                }
            }

            return errors;
        }

        if (typeof schema === "string") {
            let types: string[] = schema.split("|").map(type => type.trim());
            let objectType: string = typeof object;

            let isValidType: boolean = types.includes(objectType);
            let isValidValue: boolean = false;
            for (let type of types) {
                if (type.includes("'") && object === type.split("'")[1]) {
                    isValidValue = true;
                    break;
                }
            }

            if (isValidType === false && isValidValue === false) {
                return [tracePrefix + " (" + object + ": " + objectType + ") is not valid, expected: " + types.toString().split(",").join(" or ")];
            }

            return [];
        }

        return [];
    }

    public static numberRangeValidator(min: number, max: number): (value: any) => string {
        return ((value: any) => {
            if (typeof value !== "number" || value < min || value > max) {
                return `needs to be a number between ${min} and ${max}`;
            }
            return "";
        });
    }
}