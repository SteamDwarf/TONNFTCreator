import { OpenedWallet, sleep } from "./utils";

export const waitSeqno = async(seqno: number, {wallet}: OpenedWallet) => {
    for(let i = 0; i < 10; i++) {
        await sleep(2000);
        
        const seqnoAfter = await wallet.getSeqno();
        if(seqnoAfter === seqno + 1) break;
    }
}