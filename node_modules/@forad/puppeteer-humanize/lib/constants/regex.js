"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUMERIC_REGEX = exports.ALPHA_REGEX = exports.TERMINATION_REGEX = exports.PUNCTUATION_REGEX = exports.WHITESPACE_REGEX = void 0;
exports.WHITESPACE_REGEX = /\s/g;
exports.PUNCTUATION_REGEX = /^[@#$%^&*()\-+_=/\[\]{}:;|~<>"']+$/g;
exports.TERMINATION_REGEX = /^[.,?!]+$/g;
exports.ALPHA_REGEX = /[^a-zA-Z]/g;
exports.NUMERIC_REGEX = /[^0-9]/g;
//# sourceMappingURL=regex.js.map