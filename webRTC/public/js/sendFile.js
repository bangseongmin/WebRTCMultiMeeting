let localConnection;
let remoteConnection;

let sendChannel;

/**
 * 파일 업로드 창
 * */
function browse(){
    {
        document.getElementById('div1').innerHTML = '<input type="file" id="fileBox" />';
        var fb = document.getElementById('fileBox');
        fb.addEventListener('change', handleFileInputChange, false);
        fb.click();

    }
}

async function handleFileInputChange() {
    fileInput = document.getElementById('fileBox');
    const file = fileInput.files[0];
    if (!file) {
        console.log('No file chosen');
    } else {
        createConnection();
    }
}

async function createConnection() {
    localConnection = new RTCPeerConnection();
    console.log('Created local peer connection object localConnection');

    sendChannel = localConnection.createDataChannel('sendDataChannel');
    sendChannel.binaryType = 'arraybuffer';
    console.log('Created send data channel');

    sendChannel.addEventListener('open', onSendChannelStateChange);
    sendChannel.addEventListener('close', onSendChannelStateChange);
    sendChannel.addEventListener('error', onError);

    localConnection.addEventListener('icecandidate', async event => {
        console.log('Local ICE candidate: ', event.candidate);
        await remoteConnection.addIceCandidate(event.candidate);
    });

    remoteConnection = new RTCPeerConnection();
    console.log('Created remote peer connection object remoteConnection');

    remoteConnection.addEventListener('icecandidate', async event => {
        console.log('Remote ICE candidate: ', event.candidate);
        await localConnection.addIceCandidate(event.candidate);
    });
    remoteConnection.addEventListener('datachannel', receiveChannelCallback);

    try {
        const offer = await localConnection.createOffer();
        await gotLocalDescription(offer);
    } catch (e) {
        console.log('Failed to create session description: ', e);
    }

    fileInput.disabled = true;
}

/**
 * sendChannel 채널 변화
 * **/

function onSendChannelStateChange() {
    if (sendChannel) {
        const {readyState} = sendChannel;
        console.log(`Send channel state is: ${readyState}`);
        if (readyState === 'open') {
            sendData();
        }
    }
}

function onError(error) {
    if (sendChannel) {
        console.error('Error in sendChannel:', error);
        return;
    }
    console.log('Error in sendChannel which is already closed:', error);
}

/**
 * 파일 전송
 * */
let fileReader;
let fileInput = document.getElementById('fileBox');

function sendData() {
    fileInput = document.getElementById('fileBox');
    const file = fileInput.files[0];
    console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

    // Handle 0 size files.
    const url = window.URL.createObjectURL(file);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);

    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);


    if (file.size === 0) {
        closeDataChannels();
        return;
    }

    const chunkSize = 16384;
    fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    fileReader.addEventListener('load', e => {
        console.log('FileRead.onload ', e);
        sendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
            readSlice(offset);
        }
    });

    const readSlice = o => {
        console.log('readSlice ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
}

let receiveChannel;
function closeDataChannels() {
    console.log('Closing data channels');
    sendChannel.close();
    console.log(`Closed data channel with label: ${sendChannel.label}`);
    sendChannel = null;

    if (receiveChannel) {
        receiveChannel.close();
        console.log(`Closed data channel with label: ${receiveChannel.label}`);
        receiveChannel = null;
    }

    localConnection.close();
    remoteConnection.close();
    localConnection = null;
    remoteConnection = null;
    console.log('Closed peer connections');

    // re-enable the file select
    fileInput.disabled = false;
}

function receiveChannelCallback(event) {
    console.log('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.binaryType = 'arraybuffer';
    receiveChannel.onmessage = onReceiveMessageCallback;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;

    receivedSize = 0;
    // bitrateMax = 0;
    // downloadAnchor.textContent = '';
    // downloadAnchor.removeAttribute('download');
    // if (downloadAnchor.href) {
    //     URL.revokeObjectURL(downloadAnchor.href);
    //     downloadAnchor.removeAttribute('href');
    // }
}

let receiveBuffer = [];
let receivedSize = 0;
function onReceiveMessageCallback(event) {
    console.log(`Received Message ${event.data.byteLength}`);
    receiveBuffer.push(event.data);
    receivedSize += event.data.byteLength;

    // we are assuming that our signaling protocol told
    // about the expected file size (and name, hash, etc).
    const file = fileInput.files[0];
    if (receivedSize === file.size) {
        const received = new Blob(receiveBuffer);
        receiveBuffer = [];

        // downloadAnchor.href = URL.createObjectURL(received);
        // downloadAnchor.download = file.name;
        // downloadAnchor.textContent =
        //     `Click to download '${file.name}' (${file.size} bytes)`;
        // downloadAnchor.style.display = 'block';

        // if (statsInterval) {
        //     clearInterval(statsInterval);
        //     statsInterval = null;
        // }

        closeDataChannels();
    }
}


async function onReceiveChannelStateChange() {
    if (receiveChannel) {
        const readyState = receiveChannel.readyState;
        console.log(`Receive channel state is: ${readyState}`);
    }
}


async function gotLocalDescription(desc) {
    await localConnection.setLocalDescription(desc);
    console.log(`Offer from localConnection\n ${desc.sdp}`);
    await remoteConnection.setRemoteDescription(desc);
    try {
        const answer = await remoteConnection.createAnswer();
        await gotRemoteDescription(answer);
    } catch (e) {
        console.log('Failed to create session description: ', e);
    }
}

async function gotRemoteDescription(desc) {
    await remoteConnection.setLocalDescription(desc);
    console.log(`Answer from remoteConnection\n ${desc.sdp}`);
    await localConnection.setRemoteDescription(desc);
}