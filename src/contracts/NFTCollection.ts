import { Address, beginCell, Cell, contractAddress, internal, SendMode } from "@ton/core"
import { encodeOffChainContent, OpenedWallet } from "../utils";

export interface CollectionData {
    ownerAddress: Address;
    royaltyPercent: number;
    royaltyAddress: Address;
    nextItemIndex: number;
    collectionContentUrl: string;
    commonContentUrl: string;
}

export class NftCollecion {
    private collectionData: CollectionData;

    constructor(collectionData: CollectionData) {
        this.collectionData = collectionData;
    }

    private createCodeCell() {
        const nftCollectionCodeBoc = 'te6cckECFAEAAh8AART/APSkE/S88sgLAQIBYgkCAgEgBAMAJbyC32omh9IGmf6mpqGC3oahgsQCASAIBQIBIAcGAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn+pqahg2IOhph+mH/SAYQAEO4tdMe1E0PpA0z/U1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNDwoCASAMCwA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx+wCAIBIA4NABs+QB0yMsCEsoHy//J0IAAtAHIyz/4KM8WyXAgyMsBE/QA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj+mf9qJofSBpn+pqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj+WfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkExIREAA8jhXU1DAQNEEwyFAFzxYTyz/MzMzJ7VTgXwSED/LwACwyNAH6QDBBRMhQBc8WE8s/zMzMye1UAKY1cAPUMI43gED0lm+lII4pBqQggQD6vpPywY/egQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis+YwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu/LhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz/MzMzJ7VSSXwXiN0CayQ==';
        return Cell.fromBase64(nftCollectionCodeBoc);
    }

    private createDataCell() {
        const dataCell = beginCell();

        dataCell.storeAddress(this.collectionData.ownerAddress);
        dataCell.storeUint(this.collectionData.nextItemIndex, 64);

        const contentCell = beginCell();
        const collectionContent = encodeOffChainContent(this.collectionData.collectionContentUrl);
        const commonContent = beginCell();
        
        commonContent.storeBuffer(Buffer.from(this.collectionData.commonContentUrl));
        contentCell.storeRef(collectionContent);
        contentCell.storeRef(commonContent.asCell());
        dataCell.storeRef(contentCell);

        const nftItemCodeCell = Cell.fromBase64('te6cckECDQEAAdAAART/APSkE/S88sgLAQIBYgMCAAmhH5/gBQICzgcEAgEgBgUAHQDyMs/WM8WAc8WzMntVIAA7O1E0NM/+kAg10nCAJp/AfpA1DAQJBAj4DBwWW1tgAgEgCQgAET6RDBwuvLhTYALXDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAw8AIEs44UMGwiNFIyxwXy4ZUB+kDUMBAj8APgBtMf0z+CEF/MPRRSMLqOhzIQN14yQBPgMDQ0NTWCEC/LJqISuuMCXwSED/LwgCwoAcnCCEIt3FzUFyMv/UATPFhAkgEBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AAH2UTXHBfLhkfpAIfAB+kDSADH6AIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQBRONkchQCc8WUAvPFnEkSRRURqBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABBHlBAqN1viDACCAo41JvABghDVMnbbEDdEAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDI04lUC8ANqhGIu');
        dataCell.storeRef(nftItemCodeCell);

        const royaltyBase = 100;
        const royaltyFactor = Math.floor(this.collectionData.royaltyPercent * royaltyBase);
        const royaltyCell = beginCell();

        royaltyCell.storeUint(royaltyFactor, 16);
        royaltyCell.storeUint(royaltyBase, 16);
        royaltyCell.storeAddress(this.collectionData.royaltyAddress);
        dataCell.storeRef(royaltyCell);

        return dataCell.endCell();
    }

    public get stateInit() {
        const code = this.createCodeCell();
        const data = this.createDataCell();

        return {code, data};
    }

    public get address() {
        return contractAddress(0, this.stateInit);
    }

    public async deploy(walletData: OpenedWallet) {
        const seqno = await walletData.wallet.getSeqno();

        await walletData.wallet.sendTransfer({
            seqno,
            secretKey: walletData.keyPair.secretKey,
            messages: [
                internal({
                    value: '0.05',
                    to: this.address,
                    init: this.stateInit
                })
            ],
            sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS
        });

        return seqno;
    }

    public async toUpBalance(
        walletData: OpenedWallet,
        nftAmount: number
    ) {
        const feeAmount = 0.026;
        const seqno = await walletData.wallet.getSeqno();
        const amount = nftAmount * feeAmount;

        await walletData.wallet.sendTransfer({
            seqno,
            secretKey: walletData.keyPair.secretKey,
            messages: [
                internal({
                    value: amount.toString(),
                    to: this.address.toString({ bounceable: false}),
                    body: new Cell()
                })
            ],
            sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS
        });

        return seqno;
    }
}