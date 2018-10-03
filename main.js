#!/usr/bin/env node
/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */
'use strict';
let p2p = require("./d_lib/p2p.js"),
    HTTP_PORT =process.argv[2] || 3001,
    P2P_PORT = process.argv[3] || 6001,
    CONSENSUS = process.argv[4] || 'min',
    NODES = process.argv[5],
    consensus;

switch (CONSENSUS) {
    case 'min':
        consensus = require('./d_lib/consensus/min/min');
        break;
    case 'pow':
        consensus = require('./d_lib/consensus/pow/pow');
        break;
}

p2p.setConsensusType(consensus, HTTP_PORT, P2P_PORT, NODES);
p2p.connectToNodes(p2p.initialNodes);
p2p.initHttpServer();
p2p.initP2PServer();