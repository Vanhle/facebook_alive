import { ElementHandle, TypeMistakeOptions } from "../types";
/**
 * Types and deletes a mistake based on a source character.
 * Locates a proximate character based on physical location on an EN format keyboard.
 *
 * @todo Add support for multilingual keyboard formats and characters.
 * @param {ElementHandle} element
 * @param {string} char
 * @param {TypeMistakeOptions} options
 * @return {Promise<void>}
 */
export declare const typeMistake: (element: ElementHandle, char: string, options?: TypeMistakeOptions) => Promise<void>;
//# sourceMappingURL=type-mistake.d.ts.map