const socket = io();
let List = {}
let renderdName = []
//graping elements
const wrapper = document.querySelector('.wrapper');
// const users = document.querySelectorAll('.user');
const userView = document.querySelector('.userView');
const userList = document.querySelector('.usersList');
const userName = document.querySelector('.userView .user');
const form = document.querySelector('#form');
const message = document.getElementById('message');
const display = document.getElementById('display')
const userWrapper = document.querySelector('.userWrapper');

display.innerHTML = '';

startAPP();
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
    const user = document.createElement('div');
    user.classList.add('user');
    if(who === 'me') {
        user.classList.add('me');
        user.innerText = text + '(you)';
    }
    else{
        user.innerText = text;
    }
    
    if(who !== 'me'){
        user.addEventListener('click', ()=>{
            userList.style.display = 'none';
            userView.style.display = 'flex';
            userName.innerText = user.innerText;
            userName.insertAdjacentHTML('afterbegin',`<i class="fa fa-solid fa-arrow-left"></i>`);
            displayChat(user.innerText);
        });
    }
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
    console.log('inside recive mess');
    socket.on('mess', mess=>{
        console.log('recieved ' + mess);
        displayMessage(mess,'another')
    });
}

function sendMessage(mess, user){
    console.log('sent ' + mess + ' to ' + user);
    socket.emit('to', mess , List[user])
}