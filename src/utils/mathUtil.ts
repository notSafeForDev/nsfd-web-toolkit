type vector2 = {
    x: number,
    y: number
}

type vector3 = {
    x: number,
    y: number,
    z: number
}

/**
 * A utility class for various math functions
 */
export class MathUtil {
    
    /** Calculates the distance between two points */
    static lerp(from: number, to: number, progress: number): number {
        return from + (to - from) * progress;
    }

    /** Calculates the percentage value, if from is at 0% and to is at 100% */
    static percentage(from: number, to: number, value: number): number {
        return value / (to - from);
    }

    /** Calculates the distance between two points */
    static distance(from: vector2, to: vector2): number {
        return Math.hypot(to.x - from.x, to.y - from.y);
    }

    /** Calculates the distance between two points */
    static distance3D(from: vector3, to: vector3): number {
        return Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    }

    /**
     * Calculates the angle between two direction vectors
     * @param {vector2} point1 
     * @param {vector2} point2 
     * @returns {number} The angle between in degrees
     */
    static angleBetweenPoints(point1: vector2, point2: vector2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
    }

    /**
     * Calculates the angle between two direction vectors
     * @param {vector2} direction1 
     * @param {vector2} direction2 
     * @returns {number} The angle between in degrees
     */
    static angleBetweenDirections(direction1: vector2, direction2: vector2) {
        let angle1 = Math.atan2(direction1.x, direction1.y) * 180 / Math.PI;
        let angle2 = Math.atan2(direction2.x, direction2.y) * 180 / Math.PI;
        let angleBetween = Math.abs(angle1 - angle2);
        if (angleBetween > 180) {
            return 360 - angleBetween;
        }
        return angleBetween;
    }

    // Solution by fafase, https://answers.unity.com/questions/317648/angle-between-two-vectors.html#:~:text=Angle%20between%20two%20vectors%20-%20Unity%20Answers%20var,the%20product%20of%20the%20magnitudes%20of%20the%20vectors
    /**
     * Calculates the angle between two direction vectors
     * @param {vector3} direction1 
     * @param {vector3} direction2 
     * @returns {number} The angle between in degrees
     */
    public static angleBetweenDirections3D(direction1: vector3, direction2: vector3): number {
        let magnitude1 = Math.hypot(direction1.x, direction1.y, direction1.z);
        let magnitude2 = Math.hypot(direction2.x, direction2.y, direction2.z);
        // Get the dot product
        let dot: number = (direction1.x * direction2.x) + (direction1.y * direction2.y) + (direction1.z * direction2.z);
        // Divide the dot by the product of the magnitudes of the vectors
        dot = dot / (magnitude1 * magnitude2);
        // Get the arc cosin of the angle, you now have your angle in radians 
        let acos: number = Math.acos(dot);
        // Multiply by 180/Mathf.PI to convert to degrees
        let angle: number = acos * 180 / Math.PI;
        return angle;
    }
}