/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */
'use strict';

let logger = require('../logger');

function Daemon(options) {
    this.options = options;
}

Daemon.DETAILS = {
    alias: 'd',
    description: 'daemon',
    commands: ['start', 'node', 'stop'],
    options: {
        start: Boolean,
        node: Boolean,
        stop: Boolean
    },
    shorthands: {
        s: ['--start'],
        n: ['--node'],
        k: ['--stop']
    },
    payload: function(payload, options) {
        options.start = true;
    },
};

Daemon.prototype.run = function() {
    let instance = this,
        options = instance.options;

    if (options.start) {
        instance.runCmd('node main.js 3001 6001 min');
        instance.runCmd('open http://localhost:3001/blocks');
    } else if (options.node) {
        instance.runCmd('node main.js 3002 6002 min ws://localhost:6001');
    } else if (options.stop) {
        instance.runCmd('killall node');
    }
};

Daemon.prototype.runCmd = function(cmd) {
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

exports.Impl = Daemon;