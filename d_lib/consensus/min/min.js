/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

var crypto = require('crypto-js');

const type = "min";

let difficulty = 15,
    previousHashTime = new Date().getTime() / 1000;

// in seconds
const BLOCK_GENERATION_INTERVAL = 60;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

const getDifficulty = (index, time) => {
    if (index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && index !== 0) {
        return getAdjustedDifficulty(index, time);
    } else {
        return difficulty;
    }
};

let getAdjustedDifficulty = (index, times) => {
    let timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL,
        timeTaken = times - previousHashTime;
    if (timeTaken < timeExpected / 2) {
        return difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return difficulty - 1;
    } else {
        return difficulty;
    }
};

const findBlock = (index, previousHash, times, data) => {
    let difficulty = getDifficulty(index, times);
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, times, data, difficulty, nonce);
        console.log('---> nonce: ' + nonce + ', difficulty: ' + difficulty + ', hash: ' + hash);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return [index, previousHash, times, data, hash];
        }
        nonce++;
    }
};

const hexToBinary = (s)  => {
    let ret = '';
    const lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111'
    };
    for (let i = 0; i < s.length; i = i + 1) {
        if (lookupTable[s[i]]) {
            ret += lookupTable[s[i]];
        } else {
            return null;
        }
    }
    return ret;
};

const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};

const calculateHash = (index, previousHash, time, data,
                       difficulty, nonce) =>
    crypto.SHA256(index + previousHash + time + data + difficulty + nonce).toString();

if (typeof exports != 'undefined' ) {
    exports.type = type;
    exports.findBlock = findBlock;
}