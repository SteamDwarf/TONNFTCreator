import { Cell } from "@ton/core";
import { createOffChainContent } from "../utils";

export class NftItem {
    private _index: number;
    private _content: Cell;

    constructor(index: number, content: string) {
        this._index = index;
        this._content = createOffChainContent(content);
    }

    get content() {
        return this._content;
    }

    get index() {
        return this._index;
    }
}