import { Range } from "../types";
/**
 * Simple random number generator using a Mersenne Twister.
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export declare const rand: ({ min, max }: Range) => number;
/**
 * Simple random delay function.
 * Uses Puppeteer naming convention for consistency.
 *
 * @param {number} min
 * @param {number} max
 * @return {Promise<void>}
 */
export declare const waitForTimeout: ({ min, max }: Range) => Promise<void>;
/**
 * Simple dice roll function that accepts a probability threshold.
 *
 * @param {number} probability
 * @return {boolean}
 */
export declare const chance: (probability?: number) => boolean;
//# sourceMappingURL=utils.d.ts.map