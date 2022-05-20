const videoGrid = document.getElementById('video-grid')
const muteButton = document.getElementById('mute')
const videoButton = document.getElementById('vid-no')
const muttie = document.querySelector('#mute .audio')
let notMuted = true
let videoAvail = true
const peers = {}
const socket = io()
const myPeer = new Peer(undefined, {
    secure: true,
    // host: '/',
    host: 'videomessengerapp.herokuapp.com',
    port: '3001'
})

muteButton.addEventListener('click' ,() =>{
    muteButton.classList.toggle('red');
    muttie.classList.toggle('fa-microphone');
    muttie.classList.toggle('fa-microphone-slash');
    notMuted ? notMuted = false : notMuted = true;
    notMuted ? stop('audio') : start('audio')
} )

videoButton.addEventListener('click', () => {
    videoButton.classList.toggle('red');
    stop('video')
    videoAvail ?  videoAvail = false :  videoAvail = true;
    notMuted ?  stop('video') : start('video')
})



socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open' , id =>{
    socket.emit('join-room', RoomID, id)
})

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
   video: videoAvail,
   audio: notMuted 
}).then( stream => {
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
})

function addVideoStream(video, stream){
    video.srcObject = stream;
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