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
exports.NftCollection = void 0;
const core_1 = require("@ton/core");
const utils_1 = require("../utils");
const contracts_1 = require("../contracts");
class NftCollection {
    constructor(content) {
        this.content = content;
    }
    deploy(walletData) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = (0, utils_1.createOffChainContent)(this.content);
            this.collection = yield contracts_1.NftCollectionContract.fromInit(walletData.wallet.address, content);
            const collectionAddress = this.collection.address;
            if (!this.collection.init)
                throw ("No collection init");
            const seqno = yield walletData.wallet.getSeqno();
            yield walletData.wallet.sendTransfer({
                seqno,
                secretKey: walletData.keyPair.secretKey,
                messages: [
                    (0, core_1.internal)({
                        value: '0.05',
                        to: collectionAddress,
                        init: this.collection.init
                    })
                ],
                sendMode: core_1.SendMode.IGNORE_ERRORS
            });
            return seqno;
        });
    }
    mintNft(walletData, nft, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.collection)
                throw ('You haven`t deployed collection');
            const seqno = yield walletData.wallet.getSeqno();
            const mintMessage = this.getMintNftMessage(0, nft.index, ownerAddress, nft.content, ownerAddress);
            yield walletData.wallet.sendTransfer({
                seqno,
                secretKey: walletData.keyPair.secretKey,
                messages: [
                    (0, core_1.internal)({
                        value: '0.05',
                        to: this.collection.address,
                        body: mintMessage
                    })
                ],
                sendMode: core_1.SendMode.IGNORE_ERRORS
            });
            return seqno;
        });
    }
    getMintNftMessage(queryId, nftIndex, owner, content, responseAddress) {
        return (0, core_1.beginCell)()
            .storeUint(2172188206, 32)
            .storeUint(queryId, 64)
            .storeUint(nftIndex, 256)
            .storeAddress(owner)
            .storeRef(content)
            .storeAddress(responseAddress)
            .endCell();
    }
    get address() {
        var _a;
        return (_a = this.collection) === null || _a === void 0 ? void 0 : _a.address;
    }
}
exports.NftCollection = NftCollection;
//# sourceMappingURL=NFTCollection.js.map