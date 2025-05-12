import { CharacterType } from "../types";
/**
 * Lookup object of character types as arrays.
 * @type {Record<CharacterType, string[]>}
 */
export declare const charTypes: Record<CharacterType, string[]>;
/**
 * Determines if a specified character is whitespace.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isWhitespace: (input: string) => boolean;
/**
 * Determines if a specified character is punctuation.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isPunctuation: (input: string) => boolean;
/**
 * Determines if a specified character is a termination character.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isTermination: (input: string) => boolean;
/**
 * Determines if a specified character is an alphabet character.
 * Tests for both uppercase and lowercase.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isAlpha: (input: string) => boolean;
/**
 * Determines if a specified character is numeric.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isNumeric: (input: string) => boolean;
/**
 * Determines if a specified character is lower case.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isLowerCase: (input: string) => boolean;
/**
 * Determines if a specified character is upper case.
 *
 * @param {string} input
 * @return {boolean}
 */
export declare const isUpperCase: (input: string) => boolean;
/**
 * Provides a typed map of each character type test function.
 *
 * @type {Map<string, (input: string) => boolean>}
 */
export declare const charTypeTests: Map<CharacterType, (input: string) => boolean>;
/**
 * Detects a character type of a provided character.
 *
 * @param {string} char
 * @return {CharacterType | undefined}
 */
export declare const detectCharType: (char: string) => CharacterType | undefined;
//# sourceMappingURL=characters.d.ts.map