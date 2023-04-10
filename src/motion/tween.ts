let tweens: Tween<any>[] = [];
let isInitialized: boolean = false;
let previousTime: number;

type Options = {
    delay?: number,
    ease?: (time: number) => number,
    onUpdate?: () => any,
    onComplete?: () => any
}

/** 
 * Simple class for creating tween animations
 */
export class Tween<T> {
    private object: T;
    private duration: number;
    private to: Partial<T>;

    private from: Partial<T> = {};
    private elapsedTime: number = 0;
    private haveStarted: boolean = false;
    private delay: number;
    private ease: (time: number) => any;
    private elapsedDelayTime: number = 0;
    private onUpdate: () => any;
    private onComplete: () => any;

    constructor(object: T, duration: number, to: Partial<T>, options?: Options) {
        if (isInitialized === false) {
            previousTime = performance.now();
            setInterval(() => {
                this.onTick();
            }, 0);
            isInitialized = true;
        }

        this.object = object;
        this.duration = duration;
        this.to = to;
        this.delay = (options !== undefined && options.delay) ? options.delay : 0;
        this.ease = (options !== undefined && options.ease) ? options.ease : (time: number) => time;
        this.onUpdate = (options !== undefined && options.onUpdate) ? options.onUpdate : () => { };
        this.onComplete = (options !== undefined && options.onComplete) ? options.onComplete : () => { };

        tweens.push(this);
    }

    public then(duration: number, to: Partial<T>, options?: Options) {
        options = options || {};
        options.delay = options.delay || 0;
        options.delay += this.duration + this.delay;

        return new Tween(this.object, duration, to, options);
    }

    static removeTweensForObject(object: { [key: string]: any }) {
        for (let i = 0; i < tweens.length; i++) {
            if (tweens[i].object === object) {
                tweens.splice(i, 1);
                i--;
            }
        }
    }

    protected update(deltaTime: number) {
        if (this.elapsedDelayTime < this.delay) {
            this.elapsedDelayTime += deltaTime;
            return;
        }

        if (this.haveStarted === false) {
            this.from = {}
            for (let key in this.to) {
                this.from[key] = this.object[key];
            }
            this.haveStarted = true;
        }

        this.elapsedTime += deltaTime;
        let progress: number = this.duration <= 0 ? 1 : Math.min(1, this.elapsedTime / this.duration);
        progress = this.ease(progress);

        for (let key in this.to) {
            let from = this.from[key];
            let to = this.to[key];
            if (typeof this.object[key] === "number" && typeof from === "number" && typeof to === "number") {
                (this.object[key] as number) = this.lerp(from, to, progress);
            }
        }

        this.onUpdate();
    }

    private lerp(from: number, to: number, progress: number): number {
        return from + (to - from) * progress;
    }

    private onTick() {
        let time: number = performance.now();
        let deltaTime: number = time - previousTime;
        previousTime = time;

        for (let i = 0; i < tweens.length; i++) {
            tweens[i].update(deltaTime);
            if (tweens[i].elapsedTime >= tweens[i].duration) {
                tweens[i].onComplete();
                tweens.splice(i, 1);
                i--;
            }
        }
    }
}