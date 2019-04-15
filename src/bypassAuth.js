// This is for debugging only
// Acts as a phone wallet and authenticates

var Web3 = require('web3')
const WebSocket = require('ws');

var w3 = new Web3('HTTP://127.0.0.1:8545')

// Put in the key that you want to sign in with
keys = ['0x1178EbD5A76BB40D7D3Ce2B5c5C2CA330863884B', '0x90a397184ef892dc0a26c91c5cdb2d06238b61ff337c7eb7bc88c0f3bd1e9c96']

var deeID = keys[0];
pk = keys[1]

// Put in the data shown in the QR code
var data =  "{\"type\":\"loginSig\",\"uID\":\"590ca11b-5a07-417e-8a08-d8bd3975fb31\",\"wsURL\":\"https://f6337031.ngrok.io\",\"data\":\"0x8952B5EBCa5e76C8678808e2aEdD745276c5653C\"}"
var dataParsed = JSON.parse(data)

var account = w3.eth.accounts.privateKeyToAccount(pk);

const msg = dataParsed.uID + deeID + dataParsed.expirytime + dataParsed.data;
let flatSig = account.sign(msg).signature

var ws = new WebSocket(dataParsed.wsURL);
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
setTimeout(()=>{process.exit()}, 5000)