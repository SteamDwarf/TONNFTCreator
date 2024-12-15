"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitSeqno = void 0;
const utils_1 = require("./utils");
const waitSeqno = (seqno_1, _a) => __awaiter(void 0, [seqno_1, _a], void 0, function* (seqno, { wallet }) {
    for (let i = 0; i < 10; i++) {
        yield (0, utils_1.sleep)(2000);
        const seqnoAfter = yield wallet.getSeqno();
        if (seqnoAfter === seqno + 1)
            break;
    }
});
exports.waitSeqno = waitSeqno;
//# sourceMappingURL=delay.js.map