import { KeyPair, mnemonicToPrivateKey } from "@ton/crypto"
import { beginCell, Cell, OpenedContract, TonClient, WalletContractV4 } from "@ton/ton";

export interface OpenedWallet {
    keyPair: KeyPair;
    wallet: OpenedContract<WalletContractV4>;
}

export const openWallet = async (mnemonic: string[], testnet: boolean): Promise<OpenedWallet> => {
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    const tonCenterBaseEndpoint = testnet
        ? 'https://testnet.toncenter.com'
        : 'https://toncenter.com';

    const client = new TonClient({
        endpoint: `${tonCenterBaseEndpoint}/api/v2/jsonRPC`,
        apiKey: process.env.TONCENTER_API_KEY
    })

    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    })

    const contract = client.open(wallet);

    return {wallet: contract, keyPair}
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const bufferToChunk = (buff: Buffer, chunkSize: number) => {
    const chunks: Buffer[] = [];

    while(buff.byteLength > 0) {
        chunks.push(buff.subarray(0, chunkSize));
        buff = buff.subarray(chunkSize);
    }

    return chunks;
}

export const makeSnakeCell = (data: Buffer): Cell => {
    const chunks = bufferToChunk(data, 127);
    
    if(chunks.length === 0) return beginCell().endCell();
    if(chunks.length === 1) return beginCell().storeBuffer(chunks[0]).endCell();

    let curCell = beginCell();

    for(let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];

        curCell.storeBuffer(chunk);

        if(i - 1 >= 0) {
            const nextCell = beginCell();

            nextCell.storeRef(curCell);
            curCell = nextCell;
        }
    }
    
    return curCell.endCell();
}

export const encodeOffChainContent = (content: string) => {
    let data = Buffer.from(content);
    const offChainPreffix = Buffer.from([0x01]);

    data = Buffer.concat([offChainPreffix, data]);
    return makeSnakeCell(data);
}