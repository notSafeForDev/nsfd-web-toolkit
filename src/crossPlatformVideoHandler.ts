type requestVideoFramesEvent = {
    cancelled: boolean
}

/**
 * Class that makes it easier to work with the native HTMLVideoElement.
 * 
 * It provides callbacks for when the video have started buffering and is done buffering
 */
export class CrossPlatformVideoHandler {

    public video: HTMLVideoElement;
    public isLoaded = false;
    public isBuffering = false;

    private canPlay = false;
    private exitingBufferingState = false;
    private requestVideoFramesEvent: requestVideoFramesEvent | undefined;

    public onError = (message: string) => { }
    public onLoaded = () => { }
    public onBufferStart = () => { }
    public onBufferDone = () => { }

    /** 
     * @param {HTMLVideoElement} video 
     * @param {Object} options
     * @param {boolean} options.enablePlaysInline Apply settings to the video to make it work more consistently across different platforms
     * @example 
     * {
     *      // Makes the video not open in fullscreen on iOS
     *      enablePlaysInline: true
     * }
     */
    constructor(video: HTMLVideoElement, { enablePlaysInline = false } = {}) {
        this.video = video;

        video.addEventListener("loadedmetadata", () => this.onLoadedMetaData());
        video.addEventListener("play", () => this.onPlay());
        video.addEventListener("canplay", () => this.onCanPlay());
        video.addEventListener("playing", () => this.onPlaying());
        video.addEventListener("pause", () => this.onPause());
        video.addEventListener("seeking", () => this.onSeeking());
        video.addEventListener("seeked", () => this.onSeeked());
        video.addEventListener("waiting", () => this.onWaiting());

        if (enablePlaysInline) {
            this.video.playsInline = true;
        }
    }

    /**
     * Attemps to play the video. 
     * 
     * If there are any errors, the onError callback is called with the error message.
     * This also catches addtional errors, such as if the video have not been loaded or if it isn't allowed to be played.
     */
    public play() {
        this.video.play().catch(error => {
            this.onError("CrossPlatformVideoHandler.play: " + error);
        }).then(() => {
            if (this.video.paused === false) {
                return;
            }
            if (this.isLoaded === false) {
                this.onError("CrossPlatformVideoHandler.play: Unable to play video, the video is not loaded");
            }
            if (this.isLoaded) {
                this.onError("CrossPlatformVideoHandler.play: Unable to play video. You most likely need to call play from a user input event the first time you are playing a video");
            }
        });
    }

    private onLoadedMetaData() {
        this.isLoaded = true;
        this.onLoaded();
    }

    private onPlay() {
        if (this.canPlay === false) {
            this.enterBufferingState();
        }
    }

    private onCanPlay() {
        this.canPlay = true;
        this.exitBufferingState();
    }

    private onPlaying() {
        this.canPlay = true;
        this.exitBufferingState();
    }

    private onPause() {
        if (this.isAppleDevice()) {
            this.exitBufferingStateImmediately();
        }
    }

    private onSeeking() {
        this.canPlay = false;
    }

    private onSeeked() {
        if (this.isAppleDevice() === false) {
            this.exitBufferingState();
            return;
        }

        if (this.video.paused === false) {
            this.enterBufferingState();
            this.exitBufferingState();
        }
    }

    private onWaiting() {
        this.canPlay = false;
        this.enterBufferingState();
    }

    private enterBufferingState() {
        if (this.isBuffering === false) {
            this.exitingBufferingState = false;
            this.isBuffering = true;
            this.onBufferStart();
        }
    }

    private exitBufferingState() {
        if (this.exitingBufferingState === true || this.isBuffering === false) {
            return;
        }

        if (this.isAppleDevice() === false) {
            this.exitingBufferingState = false;
            this.isBuffering = false;
            this.onBufferDone();
            return;
        }

        this.exitingBufferingState = true;

        if (this.requestVideoFramesEvent !== undefined) {
            this.requestVideoFramesEvent.cancelled = true;
        }

        this.requestVideoFramesEvent = this.requestVideoFrames(2, () => {
            this.isBuffering = false;
            this.onBufferDone();
        });
    }

    private exitBufferingStateImmediately() {
        this.exitingBufferingState = false;

        if (this.requestVideoFramesEvent !== undefined) {
            this.requestVideoFramesEvent.cancelled = true;
        }

        if (this.isBuffering) {
            this.isBuffering = false;
            this.onBufferDone();
        }
    }

    /**
     * Waits until a set number of frames in the video have been rendered and then calls the provided callback.
     * Used for iOS and Mac to determine once the video is done buffering and can be resumed.
     */
    private requestVideoFrames(frameCount: number, callback: () => any, existingEvent?: requestVideoFramesEvent): requestVideoFramesEvent {
        if ((this.video as any).requestVideoFrameCallback === undefined) {
            throw new Error("Unable to request video frame, HTMLVideoElement.requestVideoFrameCallback is not available in this browser");
        }

        let requestVideoFramesEvent: requestVideoFramesEvent = existingEvent || {
            cancelled: false
        }

        this.video.requestVideoFrameCallback(() => {
            if (requestVideoFramesEvent.cancelled) {
                return;
            }
            if (frameCount <= 1) {
                callback();
            }
            if (frameCount > 1) {
                frameCount--
                this.requestVideoFrames(frameCount, callback, requestVideoFramesEvent);
            }
        });

        return requestVideoFramesEvent;
    }

    /**
     * Checks if it's iOS based on user agent and if it has a touch screen.
     * 
     * Based on: https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
     */
    private isIOS() {
        let includedInUserAgent: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent);
        return includedInUserAgent || (this.isAppleDevice() && this.hasTouchScreen());
    }

    /**
     * Checks if it's an Apple device based on user agent.
     */
    private isAppleDevice() {
        return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    }

    /**
     * Checks if the device has a touch screen.
     */
    private hasTouchScreen() {
        return ("ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0); // && this.isQuest() === false;
    }
}