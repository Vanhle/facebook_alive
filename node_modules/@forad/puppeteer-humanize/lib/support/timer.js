"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
/**
 * Basic start / stop performance timer for collecting data on action durations.
 * Used as the return type for most action functions.
 *
 * @class Timer
 * @implements PerformanceTimer
 */
class Timer {
    /**
     * Read only accessor for the start time.
     * @return {number | undefined}
     */
    get startedAt() {
        return this._startedAt;
    }
    /**
     * Read only accessor for the stop time.
     * @return {number | undefined}
     */
    get stoppedAt() {
        return this._stoppedAt;
    }
    /**
     * Command to start the timer.
     * Returns self for chaining.
     */
    start() {
        this._startedAt = Date.now();
        return this;
    }
    /**
     * Command to stop the timer.
     * Returns self for chaining.
     */
    stop() {
        this._stoppedAt = Date.now();
        return this;
    }
    /**
     * Determines if the timer has started.
     *
     * @return {boolean}
     */
    hasStarted() {
        return !!this._startedAt;
    }
    /**
     * Determines if the timer has stopped.
     *
     * @return {boolean}
     */
    hasStopped() {
        return !!this._stoppedAt;
    }
    /**
     * Calculates the duration of the timer, provided the timer has stopped.
     *
     * @return {number | undefined}
     */
    duration() {
        return this._startedAt && this._stoppedAt
            ? this._stoppedAt - this._startedAt
            : undefined;
    }
}
exports.Timer = Timer;
//# sourceMappingURL=timer.js.map