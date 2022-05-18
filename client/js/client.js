const socket = io();
let List = {}
let renderdName = []
let me
let caller
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

display.innerHTML = '';

startAPP();
Answer();
receiveMessage();


function startAPP(){
    userWrapper.innerHTML= ``;
    wrapper.style.display = 'none';
    const dispName = document.querySelector('.name');
    dispName.innerHTML = `<h1> Write your name: </h1>
    <form id="form1"><input type="text" id="name">
    <button id="submitButton">send</button>
    </form>
    `;
    const formName = document.querySelector('#form1');
    const name = document.querySelector('#name');

    formName.addEventListener('submit', e=>{
        e.preventDefault()
        const text = name.value;
        dispName.innerHTML = '';
        if(text == '') return
        handleForm(text)
    })
}

function handleForm(text){
    socket.emit('name' , text)
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
            callUser(user.innerText)
            location.href = `/call/${user.innerText}`;
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

function callUser(user){
    socket.emit('call', List[user], me)
}

function Answer(){
    const incomingCall = document.querySelector('.incoming-call');
    const callerName = document.querySelector('.callerName');
    
    
    socket.on('incoming-call', user => {
        const audio = new Audio('/assets/audio/hello.mp3');
        audio.play();
        userList.style.display = 'none';
        incomingCall.style.display = 'flex';
        callerName.innerText =  user;
        caller = user
    })
}


function AnsweredVideo(){
    socket.emit('whoCalled', me) 
    socket.on('link', unique => {
        location.href = `/${unique}`
        })

   
}

function decline(){

}
