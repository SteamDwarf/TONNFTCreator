import * as dotenv from 'dotenv';
import { openWallet } from './utils';
import { updateMetadataFiles, uploadFolderToIPFS } from './metadata';
import path from 'path';
import { CollectionData, NftCollecion } from './contracts/NFTCollection';
import { waitSeqno } from './delay';

dotenv.config();

const init = async () => {
    const metadataFolder = path.join(__dirname, '../', 'data/metadata');
    const imagesFolder = path.join(__dirname, '../', 'data/images');

    const wallet = await openWallet(process.env.MNEMONIC!.split(' '), true);

    console.log('Uploading images to pinata...');
    const imagesIpfsHash = await uploadFolderToIPFS(imagesFolder);
    console.log('Images Successfully uploaded!');

    console.log('Uploading metadata to pinata...');
    await updateMetadataFiles(metadataFolder, imagesIpfsHash);
    const metadataIpfsHash = await uploadFolderToIPFS(metadataFolder);
    console.log('Metadata Successfully uploaded!');

    console.log('Start deploy nft collection...');
    const collectionData: CollectionData = {
        ownerAddress: wallet.wallet.address,
        royaltyPercent: 0.5,
        royaltyAddress: wallet.wallet.address,
        nextItemIndex: 0,
        collectionContentUrl: `ipfs://${metadataIpfsHash}/collection.json`,
        commonContentUrl: `ipfs://${metadataIpfsHash}`
    }
    const collection = new NftCollecion(collectionData);
    let seqno = await collection.deploy(wallet);

    console.log(`Collection has deployed: ${collection.address}`);
    await waitSeqno(seqno, wallet);
}

init();