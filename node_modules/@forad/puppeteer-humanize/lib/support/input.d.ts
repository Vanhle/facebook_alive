import { KeypressDelay } from "../types/input";
/**
 * Selects a random alphanumeric character based on the source character type.
 *
 * @param {string} char
 * @return {string}
 */
export declare const getRandomChar: (char: string) => string;
/**
 * Selects a random character proximate to the source character.
 *
 * @param {string} char
 * @return {string | undefined}
 */
export declare const getProximateChar: (char: string) => string | undefined;
/**
 * Determines if a character in a sequence falls on a defined natural typing cadence.
 *
 * @param {number} position
 * @return {boolean}
 */
export declare const isCadence: (position: number) => boolean;
export declare const keypressDelay: () => KeypressDelay;
//# sourceMappingURL=input.d.ts.map