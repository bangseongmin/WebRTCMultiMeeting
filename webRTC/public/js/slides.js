var slides = document.querySelector('.slides'),
    slide = document.querySelectorAll('.vid'),
    currentIdx = 0,
    slideCount = slide.length,
    slideWidth = 200,
    slideMargin = 30,
    attendCount = document.getElementById("attendCount"),
    prevBtn = document.querySelector('span.prev'),
    nextBtn = document.querySelector('span.next');

slides.style.width = (slideWidth+slideMargin)*slideCount - slideMargin +'px';

function moveSlide(num){
    slides.style.left = -num*230+'px';
    currentIdx = num;
}

nextBtn.addEventListener('click', function(){
    attendCount = document.getElementById("attendCount");
    if(currentIdx<= slideCount){
        if(currentIdx+3 < attendCount.value){
            moveSlide(currentIdx+1);
        }else {
            console.log('이동 실패');
        }
    }else{
        moveSlide(0);
    }

})

prevBtn.addEventListener('click', function(){
    if(currentIdx > 0){
        moveSlide(currentIdx-1);
    }else{
        if(currentIdx-1 >0)
            moveSlide(slideCount-2);

        console.log("이동될 수 없다.");
    }
})

// 메인 화면 전환
function swapScreen(selectedIdx){
    console.log(selectedIdx);
    const videos = document.querySelectorAll('.camera');
    const Screen = document.querySelector('.shareScreen');

    Screen.srcObject = videos.item(selectedIdx).srcObject;
}

