
peers = {}


module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log('a client is connected')
        socket.emit('connectChat')
        // Initiate the connection process as soon as the client connects

        peers[socket.id] = socket

        // Asking all other clients to setup the peer connection receiver
        for(let id in peers) {
            if(id === socket.id) continue
            console.log('sending init receive to ' + socket.id)
            peers[id].emit('initReceive', socket.id)
        }

        /**
         * relay a peerconnection signal to a specific socket
         */
        socket.on('signal', data => {
            console.log('sending signal from ' + socket.id + ' to ', data)
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.id,
                signal: data.signal
            })
        })

        /**
         * remove the disconnected peer connection from all other connected clients
         */
        socket.on('disconnect', () => {
            console.log('socket disconnected ' + socket.id)
            socket.broadcast.emit('removePeer', socket.id)
            delete peers[socket.id]
        })

        /**
         * Send message to client to initiate a connection
         * The sender has already setup a peer connection receiver
         */
        socket.on('initSend', init_socket_id => {
            console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
            peers[init_socket_id].emit('initSend', socket.id)
        })

        // =================================================================================
        // 채팅 서버
        console.log('채팅 서버 : 유저 접속 됨');

        socket.on('send', function (data) {
            console.log('채팅 서버 : 전달된 메시지', data.msg)
        })

        socket.on('disConnect', function () {
            console.log('채팅 서버 : 접속 종료')

            console.log(socket.name + '님이 나가셨습니다')

            /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
            socket.broadcast.emit('update', {type: 'disconnect', name: '', message: socket.name + '님이 나가셨습니다'});
        })

        socket.on("newUser", function (name) {
            console.log("채팅 서버 : "+name + '님이 접속하였습니다.')

            /* 소켓에 이름 저장해두기 */
            socket.name = name;
            // peerName[socket.id] = name;
            /* 모든 소켓에게 전송 */
            io.sockets.emit('update', {type: 'connect', name: '', message: name + '님이 접속하였습니다.'});
        })

        /* 전송한 메시지 받기 */
        socket.on('chatMessage', function (data) {
            /* 받은 데이터에 누가 보냈는지 이름을 추가 */
            // data.name = peerName[socket.id];

            console.log(data)

            /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
            //socket.broadcast.emit('이벤트명', 전달할 데이터)
            //io.sockets.emit() = 모든 유저
            //socket.broadcast.emit() = 본인을 제외한 나머지 모두
            socket.broadcast.emit('update', data);
        })

    })

}