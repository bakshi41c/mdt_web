// This is for debugging only
// Acts as a phone wallet and authenticates

var Web3 = require('web3')
const WebSocket = require('ws');

var w3 = new Web3('HTTP://127.0.0.1:8545')

// Put in the key that you want to sign in with [public/deeid, private]
keys = ['0x058E7499A4b77e2B14ecfDf984Fce5d1cf4db5e8', '0x232ad283731d27eeb680fef977f710b84cbcc29930d0d050463a3b87d6656203']

var deeID = keys[0];
pk = keys[1]

// Put in the data shown in the QR code
var data = "{\"type\":\"loginSig\",\"uID\":\"6a8ce1d9-a7f5-44aa-8d8e-cc9ac0f3bfa3\",\"wsURL\":\"https://ferme.serveo.net\",\"data\":\"0x6F57603813Ae5e1CB5d68A4F722061EDFCeCAD42\"}"


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
