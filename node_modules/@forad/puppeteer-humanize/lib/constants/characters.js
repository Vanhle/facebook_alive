"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROXIMATE_CHARS = exports.ALPHA_CHARS = exports.NUMERIC_CHARS = exports.WHITESPACE_CHARS = exports.TERMINATION_CHARS = exports.PUNCTUATION_CHARS = void 0;
exports.PUNCTUATION_CHARS = [...`@#$%^&*()-+_=/[]{}:;|~<>"'`];
exports.TERMINATION_CHARS = [...`.,?!`];
exports.WHITESPACE_CHARS = [...` `];
exports.NUMERIC_CHARS = [...`0123456789`];
exports.ALPHA_CHARS = [
    ...`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
];
exports.PROXIMATE_CHARS = {
    A: [...`QWESZ`],
    B: [...`VFGHN`],
    C: [...`XSDFV`],
    D: [...`WERSFXC`],
    E: [...`34WRSDF`],
    F: [...`ERTDGCV`],
    G: [...`RTYFHVB`],
    H: [...`TYUGJBN`],
    I: [...`89UOJKL`],
    J: [...`UIHKNM`],
    K: [...`UIOJLNM,`],
    L: [...`IOPK;,.`],
    M: [...`HJKN,`],
    N: [...`GHJKBM`],
    O: [...`90IPKL;`],
    P: [...`0-O[L;`],
    Q: [...`12WAS`],
    R: [...`45ETDFG`],
    S: [...`QWEADZXC`],
    T: [...`56RYFGH`],
    U: [...`78YIHJK`],
    V: [...`DFGCB`],
    W: [...`23QEASD`],
    X: [...`ASDZC`],
    Y: [...`67TUGHJ`],
    Z: [...`ASDX`],
    "1": [...`2QW`],
    "2": [...`13QW`],
    "3": [...`24WE`],
    "4": [...`35ER`],
    "5": [...`46RT`],
    "6": [...`57TY`],
    "7": [...`68YU`],
    "8": [...`79UI`],
    "9": [...`80IO`],
    "0": [...`9-OP`]
};
//# sourceMappingURL=characters.js.map