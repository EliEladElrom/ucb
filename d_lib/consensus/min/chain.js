/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

let crypto = require("crypto-js"),
    Block =  require("./block.js").Block;

let getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "genesis block", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

const blockchain = [getGenesisBlock()];

nextBlock = function (blockData, consensus) {
    let previousBlock = getLatestBlock(),
        nextIndex = previousBlock.index + 1,
        nextTime = new Date().getTime() / 1000,
        retVal = consensus.findBlock(nextIndex, previousBlock.hash, nextTime, blockData);
    let newBlock = new Block(retVal[0], retVal[1], retVal[2], retVal[3], retVal[4]);
    return newBlock;
};

let getLatestBlock = () => blockchain[blockchain.length - 1];

addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

const isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index: ' + previousBlock.index + ', new index: ' + newBlock.index);
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }
    return true;
};

if (typeof exports != 'undefined' ) {
    exports.getGenesisBlock = getGenesisBlock;
    exports.nextBlock = nextBlock;
    exports.addBlock = addBlock;
    exports.blockchain = blockchain;
    exports.getLatestBlock = getLatestBlock;
}