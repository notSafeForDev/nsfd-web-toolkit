export class ObjectParser {
    public static parse(object: any, schema: { [key: string]: any } | Object[] | string | Function | boolean, { path = new Array(), output = {}, tracePrefix = "" } = {}): object {
        if (schema === true) {
            return object;
        }

        if (typeof schema === "function") {
            let value = schema(object, path);
            if (typeof value === "object") {
                return this.parse(object, value, { path, tracePrefix });
            }
            return value;
        }

        if (typeof schema === "object" && !Array.isArray(schema)) {
            if (typeof object !== "object") {
                console.warn("Unable to parse object at: " + tracePrefix);
                return output;
            }

            for (let key in schema) {
                let childSchema: any = schema[key];
                let value = object[key];
                let newTracePrefix: string = tracePrefix === "" ? key : tracePrefix + "." + key;
                let newPath = [object, ...path];
                (output as { [key: string]: any })[key] = this.parse(value, childSchema, { path: newPath, tracePrefix: newTracePrefix });
            }

            return output;
        }

        if (Array.isArray(schema)) {
            let array: any[] = [];

            if (Array.isArray(object) === false) {
                return array;
            }
            for (let i = 0; i < object.length; i++) {
                let newPath = [object, ...path];
                array.push(this.parse(object[i], schema[0], { path: newPath, tracePrefix }));
            }

            return array;
        }
    }

    public static hmsToSecondsParser() {
        return (time: any) => {
            if (typeof time !== "string") {
                return time;
            }

            let validCharacters = "0123456789.:";
            for (let character of time) {
                if (validCharacters.includes(character) === false) {
                    throw new Error("Unable to parse hms to seconds, the provided time string: " + time + ", contains a non valid character. The following characters are valid: '" + validCharacters + "'");
                }
            }

            let timeParts: string[] = time.split(":");
            let seconds: number = 0;
            let secondsPerValue: number = 1;

            timeParts.reverse();

            for (let i = 0; i < timeParts.length; i++) {
                seconds += parseFloat(timeParts[i]) * secondsPerValue;
                secondsPerValue *= 60;
            }

            return seconds;
        }
    }
}