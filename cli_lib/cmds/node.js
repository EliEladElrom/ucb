/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */
'use strict';

let logger = require('../logger');

function Node(options) {
    this.options = options;
}

Node.DETAILS = {
    alias: 'p',
    description: 'node',
    commands: ['add', 'get'],
    options: {
        add: Boolean,
        get: Boolean
    },
    shorthands: {
        a: ['--add'],
        g: ['--get']
    },
    payload: function(payload, options) {
        options.add = true;
    },
};

Node.prototype.run = function() {
    let instance = this,
        options = instance.options;

    if (options.add) {
        instance.runCmd('curl -H "Content-type:application/json" --data \'{"node" : "ws://localhost:6001"}\' http://localhost:3001/addNode');
    } else if (options.get) {
        instance.runCmd('curl http://localhost:3001/nodes');
    }
};

Node.prototype.runCmd = function(cmd) {
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

exports.Impl = Node;
