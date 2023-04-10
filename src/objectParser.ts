/**
 * Class for parsing an object into a desired format
 */
export class ObjectParser {

    /**
     * @param object the object to parse
     * @param schema the format to use
     * @example 
     * let object = {
     *      sameAsSourceObject: 1
     *      number: "1",
     *      text: 123,
     *      textArray: [1, 2, 3],
     *      position: {
     *          x: 0.00034,
     *          y: 34.34311,
     *          z: 128.82521
     *      }
     * }
     * 
     * let schema = {
     *      "sameAsSourceObject": true, // Expected: 1
     *      "number": (value: any) => parseFloat(value), // Expected: 1
     *      "text": (value: any) => value.toString(), // Expected: "123"
     *      "textArray": [(value: any) => value.toString()] // Expected: ["1", "2", "3"]
     *      "position": { // Data can be deeply nested
     *          "x": (value: any) => Math.floor(value), // Expected: 0
     *          "y": (value: any) => Math.floor(value), // Expected: 34
     *          "z": (value: any) => Math.floor(value) // Expected: 128
     *      }
     * };
     * @returns the hand pose that's detected or undefined
     */
    public static parse(object: any, schema: { [key: string]: any } | Object[] | string | Function | boolean, { path = new Array(), output = {}, tracePrefix = "" } = {}): any {
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

    public static hmsToSecondsParser(time: any) {
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