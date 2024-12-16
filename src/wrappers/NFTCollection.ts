import { Address, beginCell, Cell, contractAddress, internal, SendMode } from "@ton/core"
import { createOffChainContent, OpenedWallet } from "../utils";
import { NftCollectionContract } from "../contracts";
import { NftItem } from "./NftItem";

export class NftCollection {
    private content: string;
    private collection: NftCollectionContract | null;

    constructor(content: string) {
        this.content = content;
    }

    public async deploy(walletData: OpenedWallet) {
        const content = createOffChainContent(this.content);
        this.collection = await NftCollectionContract.fromInit(
            walletData.wallet.address,
            content
        );
        const collectionAddress = this.collection.address;

        if(!this.collection.init) throw("No collection init");

        const seqno = await walletData.wallet.getSeqno();

        await walletData.wallet.sendTransfer({
            seqno,
            secretKey: walletData.keyPair.secretKey,
            messages: [
                internal({
                    value: '0.05',
                    to: collectionAddress,
                    init: this.collection.init
                })
            ],
            sendMode: SendMode.IGNORE_ERRORS
        });

        return seqno;
    }

    public async mintNft(
        walletData: OpenedWallet, 
        nft: NftItem,
        ownerAddress: Address
    ) {
        if(!this.collection) throw('You haven`t deployed collection');

        const seqno = await walletData.wallet.getSeqno();
        const mintMessage = this.getMintNftMessage(
            0,
            nft.index,
            ownerAddress,
            nft.content,
            ownerAddress
        )

        await walletData.wallet.sendTransfer({
            seqno,
            secretKey: walletData.keyPair.secretKey,
            messages: [
                internal({
                    value: '0.05',
                    to: this.collection.address,
                    body: mintMessage
                })
            ],
            sendMode: SendMode.IGNORE_ERRORS
        });

        return seqno;
    }

    private getMintNftMessage(
        queryId: number,
        nftIndex: number,
        owner: Address,
        content: Cell,
        responseAddress: Address
    ) {
        return beginCell()
            .storeUint(2172188206, 32)
            .storeUint(queryId, 64)
            .storeUint(nftIndex, 256)
            .storeAddress(owner)
            .storeRef(content)
            .storeAddress(responseAddress)
            .endCell()
    }

    get address() {
        return this.collection?.address;
    }
}