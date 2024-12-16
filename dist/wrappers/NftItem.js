"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftItem = void 0;
const utils_1 = require("../utils");
class NftItem {
    constructor(index, content) {
        this._index = index;
        this._content = (0, utils_1.createOffChainContent)(content);
    }
    get content() {
        return this._content;
    }
    get index() {
        return this._index;
    }
}
exports.NftItem = NftItem;
//# sourceMappingURL=NftItem.js.map