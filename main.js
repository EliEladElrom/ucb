#!/usr/bin/env node
/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */
'use strict';
let p2p = require("./d_lib/p2p.js"),
    consensus;

switch (process.env.CONSENSUS || 'pow') {
    case 'pow':
        consensus = require('./d_lib/consensus/pow');
        break;
}

p2p.setConsensusType(consensus);
p2p.connectToNodes(p2p.initialNodes);
p2p.initHttpServer();
p2p.initP2PServer();