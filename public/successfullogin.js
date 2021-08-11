const pollcreationform = document.getElementsByClassName('pollcreationform')
var counterofoptions = 0;
const pollform = '<form action="/createpoll" method="post" id="pollcreationform">Question:<input type="text" name="question" id="pollcreationquestion">Options:<div id="options"><input type="text" name="optioninput" class="optioninput"></div><span id="optionaddition" onclick="addoption()">Add option</span><button type="submit">SUBMIT</button></form>'
var email, password

function navbarhideshower(){
    if (document.getElementsByClassName('navbar')[0].getAttribute('id') == 'none') document.getElementsByClassName('navbar')[0].setAttribute('id', 'navbar');
    else document.getElementsByClassName('navbar')[0].setAttribute('id', 'none');
}
function pollcreationformlaunch(){
    counterofoptions = 0;
    if (pollcreationform[0].getAttribute('id') == 'none'){
        // document.querySelector('body').style.opacity = 0.3
        pollcreationform[0].setAttribute('id', 'pollcreation');
    }
    else{
        pollcreationform[0].setAttribute('id', 'none');
        pollcreationform[0].removeChild(document.getElementById('pollcreationform'))
        pollcreationform[0].innerHTML += pollform
    }
}
function addoption() {
    var input = document.createElement("input");
    input.setAttribute("type", "option");
    input.setAttribute("name", 'optioninput');
    input.setAttribute("class", 'optioninput');
    input.setAttribute("value", "");
    document.getElementById('options').appendChild(input)
    counterofoptions += 1
}
function refreshinvitations() {
    document.getElementById('invitedteams').innerHTML = ''
    fetch('/refreshinvitations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email})}).then(response => response.json().then(data => appendtodivtoarea(data.result, 'invitedteams')))
    
    addbuttonstoinvite();
}
function refreshingcreatedteams() {
    document.getElementById('createdteamtiles').innerHTML = ''
    fetch('/refreshingcreatedteams', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            email
        })
    }).then((response) => {
        response.json().then((data) => {
            console.log(data)
            appendquestiontocreatearea(data)
        })
    })
}
function appendquestiontocreatearea(data) {
    arrayofkeys = []
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            for(let k in data[i][j]){
                arrayofkeys.push(k)
                break
            }
        break
        }
    }
    console.log(arrayofkeys.reverse())
    appendtodivtoarea(arrayofkeys, 'createdteamtiles')
}
function appendtodivtoarea(arrayofinvites, divid) {
    console.log(arrayofinvites)
    for (let i = 0; i < arrayofinvites.length; i++) {
        var div = document.createElement('div');
        div.className = divid;
        div.innerText = arrayofinvites[i].invitedteam;
        document.getElementById(divid).appendChild(div);
    }
}
function addbuttonstoinvite() {
    arrayofinvitetiles = document.getElementsByClassName('invitedteams')
    for (let i = 0; i < arrayofinvitetiles.length; i++) {
        var buttonone = document.createElement('button');
        var buttontwo = document.createElement('button');
        buttonone.innerText = 'Accept';
        buttontwo.innerText = 'Decline';
        arrayofinvitetiles[i].appendChild(buttonone);
        arrayofinvitetiles[i].appendChild(buttontwo);
        console.log('addbutoon is running')
    }
}

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  THIS IF FOR TEAMCREATIONFORM

function teamcreationformlaunch() {
    var statusofteamcreationform = document.getElementsByClassName('teamcreationform')[0].getAttribute('id')
    if (statusofteamcreationform == 'none') document.getElementsByClassName('teamcreationform')[0].setAttribute('id', '')
    else document.getElementsByClassName('teamcreationform')[0].setAttribute('id', 'none')
}
document.getElementById('teamcreationform').addEventListener('submit', (event) => {
    event.preventDefault();
    var teamname = document.getElementById('teamname').value
    fetch('/teamcreation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, teamname})
        }).then(response => response.json().then(data => console.log(data)))
})

document.getElementById('inviteuser').addEventListener('submit', (event) => {
    event.preventDefault();
    var teamname = document.getElementById('teamname').value
    fetch('/inviteuser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({teamname,
            email
        })
    }).then(response => response.json().then(data => console.log(data)))
})

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  THIS IS CODE FOR LOGIN FORM

var statuschecker = 'Login';
function inchoser(status) {
    statuschecker = status.innerText;
    if (status.innerText === 'Sign up') {
        document.getElementsByClassName('username')[0].setAttribute('id', '')
    }
    else {
        document.getElementsByClassName('username')[0].setAttribute('id', 'displaynone')
    }
}
document.getElementById('loginform').addEventListener('submit', (event) => {
    event.preventDefault();
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;
    if (statuschecker === 'Login') {
        // fetching('/login', email, password);
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password}),
            }).then((response) => {
                response.json().then((data) => {
                    if (data.status == '!exist') document.getElementById('msg').innerText = 'USER DOESNT EXIST'
                    if (data.status == 'invalidcredentials') document.getElementById('msg').innerText = 'Invalid credentials'
                    if (data.status == 'ok'){
                        document.getElementById('msg').innerText = 'loggedin successfully'
                        document.getElementsByClassName('signinbox')[0].setAttribute('id', 'none')
                        document.getElementById('heading').innerText = 'YOUR LOGIN HAS BEEN SUCCESSFUL .....!'
                        // refreshinvitations();
                        // refreshingcreatedteams();
                    }
                })
            })
    }
    else {
        fetch('/emailappendingfunction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password}),
            }).then((response) => {
                response.json().then((data) => {
                    if(data.status == 'ok'){
                        inchoser(document.getElementById('login'))
                        document.getElementById('msg').innerText = 'regestered successfully, now you can log in'
                    }
                })
            })
    }
})
document.getElementById('pollcreationform').addEventListener('submit', (event) => {
    event.preventDefault();
    jsonforpollcreation = {}
    jsonforpollcreation.question = document.getElementById('pollcreationquestion').value
    jsonforpollcreation.email = email
    jsonforpollcreation.optioninput = [];
    for (let i = 0; i < document.getElementsByClassName('optioninput').length; i++) {
        jsonforpollcreation.optioninput.push(document.getElementsByClassName('optioninput')[i].value)
    }
    jsonstring =  JSON.stringify(jsonforpollcreation)
    fetch('/createpoll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonstring,});
});

// async function fetching(endpoint, email, password) {
//     fetch(endpoint,{
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({email, password}),
//         })
//         .then(response => response.json().then((data) => {
//                                             if (data.status == 'invalidcredentials') document.getElementById('msg').innerText = 'Invalid credentials'
//                                             else if (data.status == '!exist') {
//                                                 if (endpoint === '/login') document.getElementById('msg').innerHTML = "Email doesn't exist"
//                                                 else document.getElementById('msg').innerHTML = "Email exist"
//                                             }
//                                             else{
//                                                 if (endpoint === '/login'){
//                                                     document.getElementById('msg').innerText = 'loggedin successfully'
//                                                     document.getElementsByClassName('signinbox')[0].setAttribute('id', 'none')
//                                                     document.getElementById('heading').innerText = 'YOUR LOGIN HAS BEEN SUCCESSFUL .....!'
//                                                     refreshinvitations();
//                                                     refreshingcreatedteams();
//                                                 }

//                                                 else{
//                                                     inchoser(document.getElementById('login'))
//                                                     document.getElementById('msg').innerText = 'regestered successfully, now you can log in'
//                                                 }
//                                             }
//         }));
    
// }