// This is for debugging only
// Acts as a phone wallet and authenticates

var Web3 = require('web3')
const WebSocket = require('ws');

var w3 = new Web3('HTTP://127.0.0.1:8545')

// Put in the key that you want to sign in with [public/deeid, private]
keys = ['0xa78e5bb6ff6a849e120985d32532e5067f262e19', '4811658F121192610584E514AAE203370AE902D698C0D0A3ABDF841CBB2EAB04']

var deeID = keys[0];
pk = keys[1]

// Put in the data shown in the QR code
var data = "{\"type\":\"loginSig\",\"uID\":\"9aee8bd4-c300-4f6f-9f6e-aef9e42586b6\",\"wsURL\":\"http://localhost:5678/\",\"data\":\"0x8a77326512A41BFa9f584f7aE2f332f20B4b286E\"}" 

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
