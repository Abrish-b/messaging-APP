const socket = io();
let List = {}
let renderdName = []
let me
let caller
let sex
let picked = false
//graping elements
const wrapper = document.querySelector('.wrapper');
// const users = document.querySelectorAll('.user');
const userView = document.querySelector('.userView');
const userList = document.querySelector('.usersList');
const userName = document.querySelector('.userView .user .userName');
const userRecive = document.querySelector('.userView .user');
const back = document.querySelector('.userView .user i');
const form = document.querySelector('#form');
const message = document.getElementById('message');
const display = document.getElementById('display')
const userWrapper = document.querySelector('.userWrapper');
const audio = new Audio('audio/hello.mp3');
const ring = new Audio('audio/ringing.mp3');
const incomingCall = document.querySelector('.incoming-call');
const outgoingCall = document.querySelector('.outgoing-call');
const callerName = document.querySelector('.callerName');
const calledName = document.querySelector('.calledName');
const avatarInc = document.querySelector('.avatarImage.incoming');
const avatarOut = document.querySelector('.avatarImage.outgoing');

display.innerHTML = '';

startAPP();
receiveMessage();


function startAPP(){
    userWrapper.innerHTML= ``;
    wrapper.style.display = 'none';
    const dispName = document.querySelector('.name');
    dispName.innerHTML = `
    <h1>Welcome to Messaging App</h1>
    <div class="nameWrapper">
        <div class="image"><img src="../assets/images/videochiama.gif" alt="landingGIF"></div>
        <h2> Write your Name and Gender </h2>
        <form class="nameInput" id="form1">
            <input type="text" id="name">
            <select name="gender" id="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <button id="submitButton">send</button>
        </form>
    <div>
    `;
    const formName = document.querySelector('#form1');
    const name = document.querySelector('#name');
    const gender = document.getElementById('gender');

    formName.addEventListener('submit', e=>{
        e.preventDefault()
        const text = name.value;
        dispName.innerHTML = '';
        sex = gender.value;
        if(text == '') return
        handleForm(text)
    })

}

function handleForm(text){

    socket.emit('name' , text, sex)
    socket.on('users', users=>{
        List = users;
        for (const userName of Object.keys(users)) {
            if(userName !== text & !renderdName.includes(userName)) {
                renderAll(userName)
                renderdName.push(userName)
            }
        };
    })
 
    
    renderAll(text, 'me');
    wrapper.style.display = 'flex';
}

function renderAll(text, who=''){
    back.addEventListener('click', ()=>{
        userList.style.display = 'flex';
        userView.style.display = 'none';
    })
    const user = document.createElement('div');
    const call = document.createElement('div');
    user.classList.add('user');
    if(who === 'me') {
        user.classList.add('me');
        user.innerText = text + '(you)';
        me = text
    }
    else{
        user.innerText = text;
        call.innerHTML = '<i class="fa fa-solid fa-phone"></i>';
        call.classList.add('call');
    }
    
    if(who !== 'me'){
        user.addEventListener('click', ()=>{
            userList.style.display = 'none';
            userView.style.display = 'flex';
            // userRecive.insertAdjacentHTML('afterbegin',`<i class="fa fa-solid fa-arrow-left"></i>`);
            userName.innerText = user.innerText;
            
            displayChat(user.innerText);
        });
        call.addEventListener('click' ,()=>{
            userView.style.display = 'none';
            socket.emit('on a call', me);
            callUser(user.innerText, sex)
        })
    }
    user.appendChild(call);
    userWrapper.appendChild(user);
    
}

function displayChat(user){
    form.addEventListener('submit', e=>{
        e.preventDefault()
        const text = message.value;
        if(text == '') return
        displayMessage(text);
        sendMessage(text, user);
        message.value = '';
    })
}

function displayMessage(mess, who='you') {
    const disp = document.createElement('div');
    disp.innerText = mess;
    disp.classList.add(who);
    display.appendChild(disp);
    
}

function receiveMessage(){
    socket.on('mess', mess=>{
        // console.log('recieved ' + mess);
        displayMessage(mess,'another')
    });
}

function sendMessage(mess, user){
    // console.log('sent ' + mess + ' to ' + user);
    socket.emit('to', mess , user)
}

function callUser(calleduser){
    socket.emit('call', calleduser , me )

    // setTimeout(()=>{
    // location.href = `/call/${calleduser}`;
    // },1000)
}

socket.on('incoming-call', (user, callergender) => {
        audio.play();
        if (callergender === 'female') {
            avatarInc.src = "/assets/images/avatar-svgrepo-com (2).svg"
            avatarInc.alt = "avatar-female"
        }
        userList.style.display = 'none';
        incomingCall.style.display = 'flex';
        callerName.innerText =  user;
        caller = user
    })


function AnsweredVideo(){
    socket.emit('answer', me)
    setTimeout(() => {
        socket.emit('whoCalled', me)
    }, 500);    
 
}
socket.on('link', unique => {
    setTimeout(() => {
        location.href = `/${unique}`
    }, 1500);
    })

function decline(){  
    audio.pause();
    socket.emit('decline', me)
    userList.style.display = 'flex';
    incomingCall.style.display = 'none';
}

function callerdecline(){
    socket.emit('declineCaller', me)
    ring.pause();
    userList.style.display = 'flex';
    outgoingCall.style.display = 'none';
}

socket.on('update', users => {
    userWrapper.innerHTML = '';
    renderdName = []
    renderAll(me, 'me');
    for (const userName of Object.keys(users)) {
        if(userName !== me & !renderdName.includes(userName)) {
            renderAll(userName)
            renderdName.push(userName)
        }
    };
})


socket.on('outgoing-call', (calledgender, calledname) =>{
    ring.play();
    if (calledgender === 'female') {
        avatarOut.src = "/assets/images/avatar-svgrepo-com (2).svg"
        avatarOut.alt = "avatar-female"
    }
    userView.style.display = 'none';
    userList.style.display = 'none';
    outgoingCall.style.display = 'flex';
    calledName.innerText =  calledname
})

socket.on('answered', (calleduser) => {
    location.href = `/call/${calleduser}`;
})

socket.on('declined', () => {
    ring.pause();
    userList.style.display = 'flex';
    outgoingCall.style.display = 'none';
})
socket.on('callCancelled', () => {
    audio.pause();
    userList.style.display = 'flex';
    incomingCall.style.display = 'none';
})