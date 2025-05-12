import { PerformanceTimer } from "../types";
/**
 * Basic start / stop performance timer for collecting data on action durations.
 * Used as the return type for most action functions.
 *
 * @class Timer
 * @implements PerformanceTimer
 */
export declare class Timer implements PerformanceTimer {
    /**
     * Internally tracks the registered start time.
     * @type {number | undefined}
     * @private
     */
    private _startedAt;
    /**
     * Internally tracks the registered stop time.
     * @type {number | undefined}
     * @private
     */
    private _stoppedAt;
    /**
     * Read only accessor for the start time.
     * @return {number | undefined}
     */
    get startedAt(): number | undefined;
    /**
     * Read only accessor for the stop time.
     * @return {number | undefined}
     */
    get stoppedAt(): number | undefined;
    /**
     * Command to start the timer.
     * Returns self for chaining.
     */
    start(): PerformanceTimer;
    /**
     * Command to stop the timer.
     * Returns self for chaining.
     */
    stop(): PerformanceTimer;
    /**
     * Determines if the timer has started.
     *
     * @return {boolean}
     */
    hasStarted(): boolean;
    /**
     * Determines if the timer has stopped.
     *
     * @return {boolean}
     */
    hasStopped(): boolean;
    /**
     * Calculates the duration of the timer, provided the timer has stopped.
     *
     * @return {number | undefined}
     */
    duration(): number | undefined;
}
//# sourceMappingURL=timer.d.ts.map