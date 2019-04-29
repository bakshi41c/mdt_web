// This is for debugging only
// Acts as a phone wallet and authenticates

var Web3 = require('web3')
const WebSocket = require('ws');

var w3 = new Web3('HTTP://127.0.0.1:8545')

// Put in the key that you want to sign in with [public/deeid, private]
keys = ['0x418E285eBa1350719F232802CBa15d688a2A8e68', '0xdf11ecb66a235dfe7fce4564bf381ae5f765033c6f2cfa5fb8dfe9d3b6968ce6']

var deeID = keys[0];
pk = keys[1]

// Put in the data shown in the QR code
var data = "{\"type\":\"loginSig\",\"uID\":\"1d0a4ae7-38de-4a31-b62c-406dfe67e374\",\"wsURL\":\"https://ferme.serveo.net\",\"data\":\"0x3bf5dA1546e112dfc1F919893c5707d7C2e2A6DB\"}"


// Put in the URL of the server
var wsURL = "http://localhost:5678/"

var dataParsed = JSON.parse(data)
var account = w3.eth.accounts.privateKeyToAccount(pk);
const msg = dataParsed.uID + deeID + dataParsed.expirytime + dataParsed.data;
let flatSig = account.sign(msg).signature

var ws = new WebSocket(wsURL);
ws.onopen = () => {
    var payload = JSON.stringify({
        'type': 'loginSig',
        'uID': dataParsed.uID,
        'deeID': deeID,
        'expirytime': '',
        'data': dataParsed.data,
        'msg': msg,
        'signature' : flatSig
    });

    ws.send(payload);
};
console.log('sent!')
setTimeout(()=>{process.exit()}, 5000) // exit after 5 seconds, to complete all network interactions
