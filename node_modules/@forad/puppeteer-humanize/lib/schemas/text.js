"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterTypeSchema = void 0;
const zod_1 = require("zod");
exports.CharacterTypeSchema = zod_1.z.enum([
    "alpha",
    "numeric",
    "punctuation",
    "termination",
    "whitespace"
]);
//# sourceMappingURL=text.js.map