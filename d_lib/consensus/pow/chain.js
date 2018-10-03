/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

let crypto = require("crypto-js"),
    moment = require("moment"),
    Block =  require("./block.js").Block,
    BlockHeader =  require("./block.js").BlockHeader;

let getGenesisBlock = () => {
    let blockHeader = new BlockHeader("1", "0", "0x1bc3300000000000000000000000000000000000000000000", moment().format(), "0x181b8330", );
    return new Block(0, 1465154705, "genesis block");
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