"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPassword = exports.HashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const HashPassword = async (passwd) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return await bcrypt_1.default.hash(passwd, salt);
};
exports.HashPassword = HashPassword;
const CheckPassword = async (passwd, Hash) => {
    return await bcrypt_1.default.compare(passwd, Hash);
};
exports.CheckPassword = CheckPassword;
//# sourceMappingURL=auth.js.map