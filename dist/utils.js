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
exports.createOffChainContent = exports.makeSnakeCell = exports.bufferToChunk = exports.sleep = exports.openWallet = exports.getClient = void 0;
const crypto_1 = require("@ton/crypto");
const ton_1 = require("@ton/ton");
const getClient = (testnet) => {
    const tonCenterBaseEndpoint = testnet
        ? 'https://testnet.toncenter.com'
        : 'https://toncenter.com';
    return new ton_1.TonClient({
        endpoint: `${tonCenterBaseEndpoint}/api/v2/jsonRPC`,
        apiKey: process.env.TONCENTER_API_KEY
    });
};
exports.getClient = getClient;
const openWallet = (mnemonic, testnet) => __awaiter(void 0, void 0, void 0, function* () {
    const keyPair = yield (0, crypto_1.mnemonicToPrivateKey)(mnemonic);
    const client = (0, exports.getClient)(testnet);
    const wallet = ton_1.WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    const contract = client.open(wallet);
    return { wallet: contract, keyPair };
});
exports.openWallet = openWallet;
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const bufferToChunk = (buff, chunkSize) => {
    const chunks = [];
    while (buff.byteLength > 0) {
        chunks.push(buff.subarray(0, chunkSize));
        buff = buff.subarray(chunkSize);
    }
    return chunks;
};
exports.bufferToChunk = bufferToChunk;
const makeSnakeCell = (data) => {
    const chunks = (0, exports.bufferToChunk)(data, 127);
    if (chunks.length === 0)
        return (0, ton_1.beginCell)().endCell();
    if (chunks.length === 1)
        return (0, ton_1.beginCell)().storeBuffer(chunks[0]).endCell();
    let curCell = (0, ton_1.beginCell)();
    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];
        curCell.storeBuffer(chunk);
        if (i - 1 >= 0) {
            const nextCell = (0, ton_1.beginCell)();
            nextCell.storeRef(curCell);
            curCell = nextCell;
        }
    }
    return curCell.endCell();
};
exports.makeSnakeCell = makeSnakeCell;
const createOffChainContent = (content) => {
    return (0, ton_1.beginCell)().storeUint(1, 8).storeStringTail(content).endCell();
    /* let data = Buffer.from(content);
    const offChainPreffix = Buffer.from([0x01]);

    data = Buffer.concat([offChainPreffix, data]);
    return makeSnakeCell(data); */
};
exports.createOffChainContent = createOffChainContent;
//# sourceMappingURL=utils.js.map