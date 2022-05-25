const videoGrid = document.getElementById('video-grid')
const muteButton = document.getElementById('mute')
const videoButton = document.getElementById('vid-no')
const muttie = document.querySelector('#mute .audio')
const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
let myStream
let notMuted = true
let videoAvail = true
const peers = {}
const socket = io()
const myPeer = new Peer(undefined, {
    // host: '/',
    // path: '/abrishapp',
    // host: '/',
    // host:'peerjs-server.herokuapp.com',
    // secure:true,
    // host: 'videomessengerapp.herokuapp.com',
    // port: '3001'
    // path : '/peerjs',
    // port: '443'
})

muteButton.addEventListener('click' ,() =>{
    muteButton.classList.toggle('red');
    muttie.classList.toggle('fa-microphone');
    muttie.classList.toggle('fa-microphone-slash');
    muteUnmute()
} )

videoButton.addEventListener('click', () => {
    videoButton.classList.toggle('red');
    playStop()
})



socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open' , id =>{
    socket.emit('join-room', RoomID, id)
})

const myVideo = document.createElement('video');
if(isSafari == true){
    myVideo.setAttribute('autoplay', '');
    myVideo.setAttribute('muted', '');
    myVideo.setAttribute('playsinline', '');
}
else{
    myVideo.muted = true;
}
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

navigator.mediaDevices.getUserMedia({
   video: true,
   audio: true 
}).then( stream => {
    myStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on("call", call => {
        call.answer(stream)
        const userVideo = document.createElement('video')
        call.on('stream', userStream => {
            addVideoStream(userVideo, userStream)
        })
    })

    socket.on("user-connected", userID => {
        setTimeout(connectToNewUser,1000,userID,stream)
        // connectToNewUser(userID, stream)
      });
}).catch(function(err) {
    console.log(err.name + ": " + err.message);
  });

function addVideoStream(video, stream){
    if ("srcObject" in video){
        video.srcObject = stream;
    }
    else{
        video.src = window.URL.createObjectURL(stream); 
    }   
    video.addEventListener('loadedmetadata' , () => {
        video.play()
        
    })
    videoGrid.append(video)
    
}

function connectToNewUser(userID, stream){
    const call = myPeer.call(userID, stream)
    const userVideo = document.createElement('video')


    call.on("stream" , userStream => {
        addVideoStream(userVideo, userStream)
    })

    call.on("close", () =>{
        userVideo.remove();
    })
    peers[userID] = call
}

function closeCall(){
    console.log('close call');
    location.href = '/';
}

function playStop(){
    const enabled = myStream.getVideoTracks()[0].enabled;
    if(enabled){
        myStream.getVideoTracks()[0].enabled = false;
       videoAvail = false;
    }
    else {
        myStream.getVideoTracks()[0].enabled = true;
        videoAvail = true;
    }
}

function muteUnmute(){
    const enabled = myStream.getAudioTracks()[0].enabled;
    if(enabled){
        myStream.getAudioTracks()[0].enabled = false;
        notMuted = false;
    }
    else {
        myStream.getAudioTracks()[0].enabled = true;
        notMuted = true;
    }
}