//graping elements

const users = document.querySelectorAll('.user');
const userView = document.querySelector('.userView');
const userList = document.querySelector('.usersList');

for(let i=0; i<users.length-1; i++){
    users[i].addEventListener('click', startChat(users[i].innerText))
}

function startChat(name){
    userList.setAttribute('display', 'none');
    console.log(name);
}
