/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */
'use strict';

let logger = require('../logger');

function Block(options) {
    this.options = options;
}

Block.DETAILS = {
    alias: 'b',
    description: 'block',
    commands: ['create'],
    options: {
        create: Boolean
    },
    shorthands: {
        s: ['--create']
    },
    payload: function(payload, options) {
        options.start = true;
    },
};

Block.prototype.run = function() {
    let instance = this,
        options = instance.options;

    if (options.create) {
        instance.runCmd('curl -H "Content-type:application/json" --data \'{"data" : "some data"}\' http://localhost:3001/mineBlock');
    }
};

Block.prototype.runCmd = function(cmd) {
    const { exec } = require('child_process');
    logger.log(cmd);
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            logger.log(`err: ${err}`);
            return;
        }
        logger.log(`stdout: ${stdout}`);
        logger.log(`stderr: ${stderr}`);
    });
};

exports.Impl = Block;
