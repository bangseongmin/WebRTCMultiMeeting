var tts = false;

const NOT = (x) => !x;


socket = io();

function toggleTTS(){
  // tts = document.getElementById('ttsStatus');
  tts = NOT(tts);

  console.log("상태값 변화 : "+ tts);
  // document.getElementById("ttsStatus").setAttribute('value', String(tts));
}


// url 에서 parameter 추출
function getParam(sname) {

  var params = location.search.substr(location.search.indexOf("?") + 1);
  var sval = "";
  var params = params.split("&");

  for (var i = 0; i < params.length; i++) {
    var temp = params[i].split("=");

    if ([temp[0]] == sname) { sval = temp[1]; }
  }

  return sval;
}

/* 접속 되었을 때 실행 */
socket.on('connect', function() {

  //아이디 가져오기--------------------------------------

  /* 이름을 입력받고 */
  var name = getParam('userID');

  /* 서버에 새로운 유저가 왔다고 알림 */
  socket.emit('newUser', name)
})

/* 서버로부터 데이터 받은 경우 */
socket.on('update', function(data) {
  var chat = document.getElementById('chat')

  var id = document.createElement('div')
  var u_id = document.createTextNode(`${data.name}`)

  var message = document.createElement('div')
  var node = document.createTextNode(`${data.message}`)
  var className = '';

  // 타입에 따라 적용할 클래스를 다르게 지정
  switch(data.type) {
    case 'chatMessage':
      className = 'other'
      break;
    case 'connect':
      className = 'connect'
      break;
    case 'disConnect':
      className = 'disconnect'
      break;
  }

  if(data.type == 'chatMessage'){
    id.classList.add('u_id')
    id.appendChild(u_id)
    chat.appendChild(id)
    data.name = getParam("userID");
  }

  message.classList.add(className)
  message.appendChild(node)
  chat.appendChild(message)

  console.log("tts status : "+tts);

  if(tts == true) {
    listen_tts(data.message);
  }
})

/* 메시지 전송 함수 */
function send() {
  // 입력되어있는 데이터 가져오기
  var message = document.getElementById('test').value

  // 가져왔으니 데이터 빈칸으로 변경
  document.getElementById('test').value = ''

  // 내가 전송할 메시지 클라이언트에게 표시
  var chat = document.getElementById('chat')
  var msg = document.createElement('div')
  var node = document.createTextNode(message)
  msg.classList.add('me')
  msg.appendChild(node)
  chat.appendChild(msg)

  // 서버로 message 이벤트 전달 + 데이터와 함께
  socket.emit('chatMessage', {type: 'chatMessage', message: message})
}


