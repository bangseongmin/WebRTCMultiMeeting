//음성 인식 객체 가져오기
var recognition;
var final_transcript = '';
var all_script = '';

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

function acoding_start() {
    annyang.start({ autoRestart: false, continuous: true, pause: true });

    recognition = annyang.getSpeechRecognizer();

    //중간 결과 반환 여부
    recognition.interimResults = true;

    //음성 인식 서비스 결과 반환 이벤트 처리
    recognition.onresult = function(event) {
        var interim_transcript = '';
        final_transcript = '';
        //실제로 반영된 배결에서 가장 낮은 인덱스 값
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                console.log("final_transcript="+final_transcript);
                //annyang.trigger(final_transcript); //If the sentence is "final" for the Web Speech API, we can try to trigger the sentence
            } else {
                interim_transcript += event.results[i][0].transcript;
                console.log("interim_transcript="+interim_transcript);
            }
        }
        
        if(final_transcript != ''){
            all_script = getParam('userID') + " : "+ final_transcript;
        }
        //'중간값:='+ interim_transcript +
        //document.getElementById('result').innerHTML = 'id' : '+ all_script;

        console.log("실행");
        // 내가 전송할 메시지 클라이언트에게 표시
        var caption = document.getElementById('result');
        var user_caption = document.createElement('div')
        var node = document.createTextNode(all_script);
        user_caption.classList.add('user_caption');
        user_caption.appendChild(node);
        caption.appendChild(user_caption);
        
        //'<br/> 자막 = ' +  all_script;
        console.log('interim='+interim_transcript+'|final='+final_transcript);
    };
}

function acoding_end(){
    console.log('종료 버튼');
    annyang.abort();
}

function language_english() {
    annyang.setLanguage('en-US');
}

function language_korea() {
    annyang.setLanguage('ko');
}
