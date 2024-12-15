import pinataSDK from '@pinata/sdk';
import { readdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const uploadFolderToIPFS = async (folderPath: string) => {
    const pinata = new pinataSDK({
        pinataApiKey: process.env.PINATA_API_KEY,
        pinataSecretApiKey: process.env.PINATA_SECRET_KEY
    });

    const response = await pinata.pinFromFS(folderPath);
    return response.IpfsHash;
}

export const updateMetadataFiles = async (folder: string, imagesIpfsHash: string) => {
    const files = readdirSync(folder);

    await Promise.all(files.map(async (filename, index) => {
        const filePath = path.join(folder, filename);
        const file = await readFile(filePath);
        const metadata = JSON.parse(file.toString());

        metadata.image = index !== files.length - 1
            ? `ipfs://${imagesIpfsHash}/${index}.png`
            : `ipfs://${imagesIpfsHash}/logo.png`;

        await writeFile(filePath, JSON.stringify(metadata));

    }))
}