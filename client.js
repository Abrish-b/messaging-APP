//graping elements

const users = document.querySelectorAll('.user');
const userView = document.querySelector('.userView');
const userList = document.querySelector('.usersList');
const userName = document.querySelector('.userView .user');
const form = document.querySelector('#form');
const message = document.getElementById('message');
const display = document.getElementById('display')

for(let i=0; i<users.length-1; i++){
    users[i].addEventListener('click', ()=>{
        userList.style.display = 'none';
        userView.style.display = 'flex';
        userName.innerText = users[i].innerText;
        console.log(users[i].innerText);
    })
}

form.addEventListener('submit', e=>{
    e.preventDefault()
    const text = message.value;
    if(text == '') return
    displayMessage(text);

    message.value = '';
})

function displayMessage(mess) {
    const disp = document.createElement('div');
    disp.innerText = mess;
    disp.classList.add('you');
    display.appendChild(disp);
}