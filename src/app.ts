import * as dotenv from 'dotenv';
import { openWallet } from './utils';
import { waitSeqno } from './delay';
import { NftCollection, NftItem } from './wrappers';

dotenv.config();

const init = async () => {
    const wallet = await openWallet(process.env.MNEMONIC!.split(' '), true);

    const metadataBaseUrl = 'https://steamdwarf.github.io/TonVillageClickerAssets/nft/metadata/';

    const collectionMetadataUrl = `${metadataBaseUrl}collection.json`;
    const collection = new NftCollection(collectionMetadataUrl);

    console.log('Deploy collection...');
    let seqno = await collection.deploy(wallet);
    await waitSeqno(seqno, wallet);
    console.log(`Collection has deployed: ${collection.address}`);

    const nftsData = [
        {
            link: `${metadataBaseUrl}0.json`,
            index: 0
        },
        {
            link: `${metadataBaseUrl}1.json`,
            index: 1
        },
        {
            link: `${metadataBaseUrl}2.json`,
            index: 2
        },
    ];

    for(let i = 0; i < nftsData.length; i++) {
        const nft = new NftItem(nftsData[i].index, nftsData[i].link);

        console.log(`Deploy nft ${nftsData[i].link}`);
        let seqno = await collection.mintNft(wallet, nft, wallet.wallet.address);
        await waitSeqno(seqno, wallet);
        console.log(`Nft has deployed!`);
    }

}



init();