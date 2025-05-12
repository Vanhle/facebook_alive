"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeIntoSchema = exports.TypeMistakeSchema = exports.DelaySchema = void 0;
const zod_1 = require("zod");
exports.DelaySchema = zod_1.z.object({
    chance: zod_1.z.number().min(0).max(100).default(100),
    min: zod_1.z.number(),
    max: zod_1.z.number()
});
exports.TypeMistakeSchema = zod_1.z.object({
    chance: zod_1.z.number().default(5),
    delay: exports.DelaySchema.default({
        chance: 100,
        min: 100,
        max: 200
    })
});
exports.TypeIntoSchema = zod_1.z.object({
    mistakes: exports.TypeMistakeSchema.default({}),
    delays: zod_1.z
        .object({
        all: exports.DelaySchema.default({ chance: 100, min: 50, max: 150 }),
        complete: exports.DelaySchema.default({ chance: 100, min: 500, max: 1000 }),
        space: exports.DelaySchema.default({ chance: 80, min: 10, max: 100 }),
        punctuation: exports.DelaySchema.default({ chance: 70, min: 50, max: 500 }),
        termination: exports.DelaySchema.default({ chance: 95, min: 100, max: 1000 }),
        cadence: exports.DelaySchema.default({ chance: 100, min: 50, max: 500 })
    })
        .default({})
});
//# sourceMappingURL=options.js.map