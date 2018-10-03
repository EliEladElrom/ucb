/*
 * Copyright 2018 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */
let WebSocket = require("ws"),
    p2p_port,
    http_port,
    express = require("express"),
    bodyParser = require('body-parser'),
    chain =  require("./consensus/pow/chain.js"),
    initialNodes,
    sockets = [],
    consensus = [];

let write = (ws, message) => ws.send(JSON.stringify(message)),
    broadcast = (message) => sockets.forEach(socket => write(socket, message));

let MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

setConsensusType = function (consensusType, HTTP_PORT, P2P_PORT, NODES) {
    consensus = consensusType;
    http_port = HTTP_PORT;
    p2p_port = P2P_PORT;
    initialNodes = NODES ? NODES.split(',') : [];
    console.log('consensus type: ' + consensus.type + ', http_port: ' + http_port + ', p2p_port: ' + p2p_port + ', initialNodes: ' + initialNodes);
};

let initHttpServer = () => {
    let app = express();
    app.use(bodyParser.json());
    app.get('/blocks', (req, res) => res.send(JSON.stringify( chain.blockchain )));
    app.post('/mineBlock', (req, res) => {
        let newBlock = chain.nextBlock(req.body.data, consensus);
        console.log("add block");
        chain.addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('chain added: ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/nodes', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addNode', (req, res) => {
        connectToNodes([req.body.node]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

let initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

let initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        let message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

let initErrorHandler = (ws) => {
    let closeConnection = (ws) => {
        console.log('connection failed to node: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

let handleBlockchainResponse = (message) => {
    let receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index)),
        latestBlockReceived = receivedBlocks[receivedBlocks.length - 1],
        latestBlockHeld = chain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' node got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received chain to our chain");
            chain.blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our node");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

let replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        chain.blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

let isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(chain.getGenesisBlock())) {
        return false;
    }
    let tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (chain.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

let responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([chain.getLatestBlock()])
});

let initP2PServer = (consensus) => {
    let server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);
};

let connectToNodes = (newNodes) => {
    newNodes.forEach((node) => {
        let ws = new WebSocket(node);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

let queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
let queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
let responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain)
});

if (typeof exports != 'undefined' ) {
    exports.initP2PServer = initP2PServer;
    exports.connectToNodes = connectToNodes;
    exports.initHttpServer = initHttpServer;
    exports.initialNodes = initialNodes;
    exports.queryChainLengthMsg = queryChainLengthMsg;
    exports.setConsensusType = setConsensusType;
}