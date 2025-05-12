import { Range } from "../types";
/**
 * Throws when an invalid range is provided to a utility function.
 *
 * @class InvalidRangeError
 * @extends Error
 */
export declare class InvalidRangeError extends Error {
    constructor({ min, max }: Range);
}
//# sourceMappingURL=exceptions.d.ts.map