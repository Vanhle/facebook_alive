"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidRangeError = void 0;
/**
 * Throws when an invalid range is provided to a utility function.
 *
 * @class InvalidRangeError
 * @extends Error
 */
class InvalidRangeError extends Error {
    constructor({ min, max }) {
        super(`Encountered an invalid range. Minimum value "${min}" cannot be greater than maximum value "${max}".`);
    }
}
exports.InvalidRangeError = InvalidRangeError;
//# sourceMappingURL=exceptions.js.map