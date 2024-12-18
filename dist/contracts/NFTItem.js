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
exports.NftItem = void 0;
const ton_1 = require("@ton/ton");
const core_1 = require("@ton/core");
class NftItem {
    constructor(collection) {
        this.collection = collection;
    }
    deploy(walletData, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const seqno = yield walletData.wallet.getSeqno();
            yield walletData.wallet.sendTransfer({
                seqno,
                secretKey: walletData.keyPair.secretKey,
                messages: [
                    (0, core_1.internal)({
                        value: "0.05",
                        to: this.collection.address,
                        body: this.collection.createMintBody(params),
                    }),
                ],
                sendMode: core_1.SendMode.IGNORE_ERRORS + core_1.SendMode.PAY_GAS_SEPARATELY,
            });
            return seqno;
        });
    }
    static getAddressByIndex(collectionAddress, itemIndex, testnet) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new ton_1.TonClient({
                endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
                apiKey: process.env.TONCENTER_API_KEY,
            });
            const response = yield client.runMethod(collectionAddress, "get_nft_address_by_index", [{ type: "int", value: BigInt(itemIndex) }]);
            return response.stack.readAddress();
        });
    }
}
exports.NftItem = NftItem;
//# sourceMappingURL=NFTItem.js.map