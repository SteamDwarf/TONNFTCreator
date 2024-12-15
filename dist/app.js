"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./utils");
const metadata_1 = require("./metadata");
const path_1 = __importDefault(require("path"));
const NFTCollection_1 = require("./contracts/NFTCollection");
const delay_1 = require("./delay");
dotenv.config();
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const metadataFolder = path_1.default.join(__dirname, '../', 'data/metadata');
    const imagesFolder = path_1.default.join(__dirname, '../', 'data/images');
    const wallet = yield (0, utils_1.openWallet)(process.env.MNEMONIC.split(' '), true);
    console.log('Uploading images to pinata...');
    const imagesIpfsHash = yield (0, metadata_1.uploadFolderToIPFS)(imagesFolder);
    console.log('Images Successfully uploaded!');
    console.log('Uploading metadata to pinata...');
    yield (0, metadata_1.updateMetadataFiles)(metadataFolder, imagesIpfsHash);
    const metadataIpfsHash = yield (0, metadata_1.uploadFolderToIPFS)(metadataFolder);
    console.log('Metadata Successfully uploaded!');
    console.log('Start deploy nft collection...');
    const collectionData = {
        ownerAddress: wallet.wallet.address,
        royaltyPercent: 0.5,
        royaltyAddress: wallet.wallet.address,
        nextItemIndex: 0,
        collectionContentUrl: `ipfs://${metadataIpfsHash}/collection.json`,
        commonContentUrl: `ipfs://${metadataIpfsHash}`
    };
    const collection = new NFTCollection_1.NftCollecion(collectionData);
    let seqno = yield collection.deploy(wallet);
    console.log(`Collection has deployed: ${collection.address}`);
    yield (0, delay_1.waitSeqno)(seqno, wallet);
});
init();
//# sourceMappingURL=app.js.map