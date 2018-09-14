/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

exports.BlockHeader = class BlockHeader {
    constructor() {
        // TODO
    }
};

exports.Block = class Block {
    constructor(index, previousHash, time, data, hash) {
        this.index = index;
        this.previousHash = previousHash;
        this.time = time;
        this.data = data;
        this.hash = hash;
    }
};