import { MathUtil } from "..";

type vector3 = {
    x: number,
    y: number,
    z: number
}

type fingerName = "thumb" | "index" | "middle" | "ring" | "pinky" | "none";

/** Both "inwards" and "outwards" are flipped depending on the hand. For the right hand: "outwards" is towards the right, whereas "inwards" is towards the left. */
type directionName = "up" | "down" | "inwards" | "outwards" | "forward" | "back";

type fingerInfo = {
    extended?: boolean,
    /** Defines a finger tip that the finger has to touch, except if "none" is set, as that means that there should be no touches. */
    touches?: fingerName,
    /** Defines the only finger tip that the finger has to touch, expect if "none" is set, as that means that there should be no touches. */
    onlyTouches?: fingerName
}

/** Each property represents x, y and z axes. */
type handDirection = {
    palm?: directionName,
    /** Roughly the direction that the thumb has when spreading all fingers. */
    thumb?: directionName,
    /** The direction from the base of the hand towards the knuckles. */
    fingers?: directionName
}

export type handPoseDetectorHandInfo = {
    isLeftHand: boolean,
    headPosition: vector3,
    headDirection: vector3,
    /** The direction from the base of the hand towards the knuckles. */
    fingersDirection: vector3,
    /** The direction that the palm is facing */
    palmDirection: vector3,
    /** Roughly the direction that the thumb has when spreading all fingers. */
    thumbDirection: vector3,
    wristPosition: vector3,
    wristDirection: vector3,
    thumbTipPosition: vector3,
    indexBasePosition: vector3,
    indexTipPosition: vector3,
    middleTipPosition: vector3,
    ringTipPosition: vector3,
    pinkyBasePosition: vector3,
    pinkyTipPosition: vector3,
}

export type handPoseDetectorPose = {
    name: string,
    /** Short for setting all fingers (including thumb) to the same values. Providing values for another finger as well will overwrite this for that perticular finger. */
    fingers?: fingerInfo,
    thumb?: fingerInfo,
    indexFinger?: fingerInfo,
    middleFinger?: fingerInfo,
    ringFinger?: fingerInfo,
    pinky?: fingerInfo,
    direction?: handDirection
}

/**
 * Class used for detecting the pose of a hand in 3D space, using joint positions
 */
export class HandPoseDetector {

    /**
     * 
     * @param handInfo 
     * @param poses 
     * @example 
     * let poses: handPoseDetectorPose[] = [
            {
                name: "thumbsUp",
                direction: { thumb: "up" },
                fingers: { extended: false },
                thumb: { extended: true }
            },
            {
                name: "okay",
                direction: { fingers: "up", palm: "inwards" },
                indexFinger: { touches: "thumb" }
            },
    ];
     * @returns 
     */
    public static detectPose(handInfo: handPoseDetectorHandInfo, poses: handPoseDetectorPose[]): handPoseDetectorPose | undefined {
        let fingersDirectionName = this.getDirectionName(handInfo.fingersDirection, handInfo.headDirection, handInfo.isLeftHand);
        let thumbDirectionName = this.getDirectionName(handInfo.thumbDirection, handInfo.headDirection, handInfo.isLeftHand);
        let palmDirectionName = this.getDirectionName(handInfo.palmDirection, handInfo.headDirection, handInfo.isLeftHand);

        let palmLength = MathUtil.distance3D(handInfo.wristPosition, handInfo.indexBasePosition);

        let thumbDistance = MathUtil.distance3D(handInfo.pinkyBasePosition, handInfo.thumbTipPosition);
        let indexDistance = MathUtil.distance3D(handInfo.wristPosition, handInfo.indexTipPosition);
        let middleDistance = MathUtil.distance3D(handInfo.wristPosition, handInfo.middleTipPosition);
        let ringDistance = MathUtil.distance3D(handInfo.wristPosition, handInfo.ringTipPosition);
        let pinkyDistance = MathUtil.distance3D(handInfo.wristPosition, handInfo.pinkyTipPosition);

        let isThumbExtended = this.isFingerExtended("thumb", thumbDistance, palmLength);
        let isIndexFingerExtended = this.isFingerExtended("index", indexDistance, palmLength);
        let isMiddleFingerExtended = this.isFingerExtended("middle", middleDistance, palmLength);
        let isRingFingerExtended = this.isFingerExtended("ring", ringDistance, palmLength);
        let isPinkyExtended = this.isFingerExtended("pinky", pinkyDistance, palmLength);

        let thumbTouches: fingerName[] = this.getTouches(handInfo.thumbTipPosition, handInfo);
        let indexTouches: fingerName[] = this.getTouches(handInfo.indexTipPosition, handInfo);
        let middleTouches: fingerName[] = this.getTouches(handInfo.middleTipPosition, handInfo);
        let ringTouches: fingerName[] = this.getTouches(handInfo.ringTipPosition, handInfo);
        let pinkyTouches: fingerName[] = this.getTouches(handInfo.pinkyTipPosition, handInfo);

        for (let pose of poses) {
            let matches: boolean[] = [
                this.matchesDirection(thumbDirectionName, pose.direction?.thumb),
                this.matchesDirection(palmDirectionName, pose.direction?.palm),
                this.matchesDirection(fingersDirectionName, pose.direction?.fingers),
                this.matchesExtended(isThumbExtended, pose.thumb?.extended),
                this.matchesExtended(isIndexFingerExtended, pose.indexFinger?.extended),
                this.matchesExtended(isMiddleFingerExtended, pose.middleFinger?.extended),
                this.matchesExtended(isRingFingerExtended, pose.ringFinger?.extended),
                this.matchesExtended(isPinkyExtended, pose.pinky?.extended),
                this.matchesTouches(thumbTouches, pose.thumb?.touches, pose.thumb?.onlyTouches),
                this.matchesTouches(indexTouches, pose.indexFinger?.touches, pose.indexFinger?.onlyTouches),
                this.matchesTouches(middleTouches, pose.middleFinger?.touches, pose.middleFinger?.onlyTouches),
                this.matchesTouches(ringTouches, pose.ringFinger?.touches, pose.ringFinger?.onlyTouches),
                this.matchesTouches(pinkyTouches, pose.pinky?.touches, pose.pinky?.onlyTouches)
            ];
            let matchesAll = matches.includes(false) === false;
            if (matchesAll) {
                return pose;
            }
        }

        return undefined;
    }

    private static matchesDirection(current: directionName, target?: directionName): boolean {
        return target === undefined || target === current;
    }

    private static matchesExtended(current: boolean, target?: boolean): boolean {
        return target === undefined || target === current;
    }

    private static matchesTouches(current: fingerName[], target?: fingerName, onlyTarget?: fingerName): boolean {
        if (onlyTarget !== undefined) {
            return (onlyTarget === "none" && current.length === 0) || (current.length === 1 && current[0] === onlyTarget);
        }
        if (target !== undefined) {
            return (target === "none" && current.length === 0) || current.includes(target);
        }
        return true;
    }

    private static isFingerExtended(finger: fingerName, tipDistance: number, palmLength: number): boolean {
        switch (finger) {
            case "thumb": return tipDistance > palmLength * 0.9;
            default: return tipDistance > palmLength * 1.5;
        }
    }

    private static getTouches(fingerTip: vector3, handInfo: handPoseDetectorHandInfo): fingerName[] {
        let positionsMap: Record<fingerName, vector3> = {
            ["thumb"]: handInfo.thumbTipPosition,
            ["index"]: handInfo.indexTipPosition,
            ["middle"]: handInfo.middleTipPosition,
            ["ring"]: handInfo.ringTipPosition,
            ["pinky"]: handInfo.pinkyTipPosition,
            ["none"]: { x: handInfo.wristPosition.x + 100, y: 0, z: 0 }
        }

        let touches: fingerName[] = [];

        for (let key in positionsMap) {
            let distance = MathUtil.distance3D(fingerTip, (positionsMap as any)[key] as vector3);
            if (distance > 0 && distance <= 0.03) {
                touches.push(key as fingerName);
            }
        }

        return touches;
    }

    private static getDirectionName(direction: vector3, headDirection: vector3, isLeftHand: boolean): directionName {
        headDirection = { x: headDirection.x, y: 0, z: headDirection.z };

        let inwardsDirection: vector3 = isLeftHand ? this.getRightRelativeTo(direction) : this.getLeftRelativeTo(direction);
        let outwardsDirection: vector3 = isLeftHand ? this.getLeftRelativeTo(direction) : this.getRightRelativeTo(direction);

        let angleDifferences: { name: directionName, angleDifference: number }[] = [
            { name: "up", angleDifference: MathUtil.angleBetweenDirections3D({ x: 0, y: 1, z: 0 }, direction) },
            { name: "down", angleDifference: MathUtil.angleBetweenDirections3D({ x: 0, y: -1, z: 0 }, direction) },
            { name: "forward", angleDifference: MathUtil.angleBetweenDirections3D(headDirection, direction) },
            { name: "back", angleDifference: 180 - MathUtil.angleBetweenDirections3D(headDirection, direction) },
            { name: "inwards", angleDifference: MathUtil.angleBetweenDirections3D(headDirection, inwardsDirection) },
            { name: "outwards", angleDifference: MathUtil.angleBetweenDirections3D(headDirection, outwardsDirection) }
        ];

        return angleDifferences.sort((a, b) => a.angleDifference - b.angleDifference)[0].name;
    }

    private static getRightRelativeTo(direction: vector3): vector3 {
        return { x: -(direction.z), y: direction.y, z: -(-direction.x) };
    }

    private static getLeftRelativeTo(direction: vector3): vector3 {
        return { x: direction.z, y: direction.y, z: -direction.x };
    }
}