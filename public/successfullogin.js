const pollcreationform = document.getElementsByClassName('pollcreationform')
var counterofoptions = 0;
const pollform = '<form action="/createpoll" method="post" id="pollcreationform">Question:<input type="text" name="question" id="pollcreationquestion">Options:<div id="options"><input type="text" name="optioninput" class="optioninput"></div><span id="optionaddition" onclick="addoption()">Add option</span><button type="submit">SUBMIT</button></form>'
var email, password, teamname, clickeddivid

function navbarhideshower(){
    if (document.getElementsByClassName('navbar')[0].getAttribute('id') == 'none') document.getElementsByClassName('navbar')[0].setAttribute('id', 'navbar');
    else document.getElementsByClassName('navbar')[0].setAttribute('id', 'none');
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
    let flag = 'pending'
    document.getElementById('invitedteams').innerHTML = ''
    fetch('/refreshinvitations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, flag})}).then(response => response.json().then((data) => {
            console.log(data)
            appendtodivtoarea(data.result, 'invitedteams', 'invitedteam', 'teamnamewithmail')
        }))

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
    }).then(response => response.json().then(data => appendtodivtoarea(data.result, 'createdteamtiles', 'teamname', 'teamnamewithmail')))
}
function appendtodivtoarea(arrayofinvites, divid, thirdparam, fourthparam) {
    console.log(arrayofinvites, fourthparam)
    if(arrayofinvites !== undefined){
        for (let i = 0; i < arrayofinvites.length; i++) {
            var div = document.createElement('div');
            div.className = divid;
            div.id = arrayofinvites[i][fourthparam]
            div.innerText = arrayofinvites[i][thirdparam];
            div.setAttribute('onclick', 'memberadder(event)')
            document.getElementById(divid).appendChild(div);
        }
    }
}
function refreshingacceptedteams() {
    document.getElementById('acceptedteamtiles').innerHTML = '';
    let flag = 'accepted'
    document.getElementById('invitedteams').innerHTML = ''
    fetch('/refreshinvitations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, flag})}).then(response => response.json().then((data) => {
            appendtodivtoarea(data.result, 'acceptedteamtiles', 'invitedteam', 'teamnamewithmail');
            refreshinvitations()
        }))
}
function memberadder(event){
    clickeddivid = event.target.id
    document.getElementById('polls').innerHTML = '';
    invititionteamtoadd = event.target.innerText
    console.log(event.target.parentNode.getAttribute('id'))
    if(event.target.parentNode.getAttribute('id') == 'invitedteams'){
        document.getElementsByClassName('sendinvititions')[0].setAttribute('id', 'none')
        fetch('/invititionadder', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                invititionteamtoadd, email
            })
        }).then(response => response.json().then(refreshingacceptedteams()))
    }
    if(event.target.parentNode.getAttribute('id') == 'acceptedteamtiles'){
        document.getElementsByClassName('sendinvititions')[0].setAttribute('id', 'none')
        document.getElementById('teamnameandmail').innerText = event.target.innerText
        fetch('/getpolls', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                email, clickeddivid
            })
        }).then(response => response.json().then(data => appendingpolltoworkspace(data.arrayofhashedquestions, data.pollstosend)))
    }
    if(event.target.parentNode.getAttribute('id') == 'createdteamtiles'){
        document.getElementsByClassName('sendinvititions')[0].setAttribute('id', 'inviteuser')
        document.getElementById('teamnameandmail').innerText = event.target.innerText
        fetch('/getpolls', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                email, clickeddivid
            })
        }).then(response => response.json().then((data) => {
            appendingpolltoworkspace(data.arrayofhashedquestions, data.pollstosend)
            addendingbuttons()
        }))
    }
}
function appendingpolltoworkspace(arrayofhashedquestions, pollstosend){
    console.log(arrayofhashedquestions, pollstosend)
    var question
    for (let i = 0; i < arrayofhashedquestions.length; i++) {
        var div = document.createElement('div');
        div.className = 'perticularpoll';
        div.id = arrayofhashedquestions[i]
        document.getElementById('polls').appendChild(div);
    }
    for (let i = 0; i < pollstosend.length; i++) {
        for (let j = 0; j < pollstosend[i].length; j++) {
            if(j == 0){
                optioncheck = []
                for (var perticularpoll in pollstosend[i][j]) {
                    question = perticularpoll
                    document.getElementsByClassName('perticularpoll')[i].innerHTML = '<h3>' + question + '</h3>'
                    break;
                }
            }
            var div = document.createElement('div');
            div.className = 'option';
            div.id = pollstosend[i][j][question]
            if(pollstosend[i][j].ended != undefined)div.innerText = pollstosend[i][j][question] + ' (' + pollstosend[i][j].ended + ')';
            else div.innerText = pollstosend[i][j][question]
            div.setAttribute('onclick', 'votecounter(event)')
            document.getElementsByClassName('perticularpoll')[i].appendChild(div);
            // document.getElementsByClassName('perticularpoll')[i].innerHTML += pollstosend[i][j][question] + '<br>'
        }
    }
}
function addendingbuttons(){
    console.log('addendingbuttons is running')
    var polldivs = document.getElementsByClassName('perticularpoll')
    for (let i = 0; i < polldivs.length; i++) {
        var button = document.createElement('button')
        button.setAttribute('onclick', 'endpoll(event)')
        button.innerText = 'END POLL'
        polldivs[i].appendChild(button)
    }
}
function endpoll(event){
    poll = event.target.parentNode.id
    fetch('/endpoll', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            poll, email
        })
    })
}

function votecounter(event){
    console.log(event.target.parentNode.innerText)
    votedquestion = event.target.parentNode.innerText
    poll = event.target.parentNode.id
    optionchosen = event.target.id
    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            poll, optionchosen, email
        })
    })
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
    teamname = document.getElementById('teamname').value
    console.log(teamname)
    fetch('/teamcreation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, teamname})
        }).then(response => response.json().then(data => console.log(data)))
    refreshinvitations();
    refreshingacceptedteams();
    refreshingcreatedteams();
    teamcreationformlaunch();
})

document.getElementsByClassName('sendinvititions')[0].addEventListener('submit', (event) => {
    event.preventDefault();
    var invitee = document.getElementById('guest').value
    teamname = document.getElementById('teamnameandmail').innerText
    fetch('/inviteuser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({teamname,
            invitee,
            email
        })
    }).then(response => response.json().then(data => console.log(data)))
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// THIS IS CODE FOR POLL CREATION FORM// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

document.getElementById('pollcreationform').addEventListener('submit', (event) => {
    event.preventDefault();
    var teamnameandmail = document.getElementById('teamnameandmail').innerText
    jsonforpollcreation = {}
    jsonforpollcreation.question = document.getElementById('pollcreationquestion').value
    jsonforpollcreation.email = email
    jsonforpollcreation.optioninput = [];
    jsonforpollcreation.teamnameandmail = clickeddivid;
    console.log(jsonforpollcreation.teamnameandmail)
    for (let i = 0; i < document.getElementsByClassName('optioninput').length; i++) {
        jsonforpollcreation.optioninput.push(document.getElementsByClassName('optioninput')[i].value)
    }
    jsonstring =  JSON.stringify(jsonforpollcreation)
    fetch('/createpoll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonstring});
    pollcreationformlaunch();
    refreshingcreatedteams()
});


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
        initializer()
    }
}
function initializer(){
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
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
                        document.getElementsByClassName('bodyschild')[0].setAttribute('id', 'bodyschild')
                        refreshinvitations();
                        refreshingacceptedteams();
                        refreshingcreatedteams();
                    }
                })
            })
    }
    else {
        fetch('/emailappendingfunc', {
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
                    if(data.status == '!exist'){
                        document.getElementById('msg').innerText = 'User alredy exists'
                    }
                })
            })
    }
})
function logout(){
    document.getElementsByClassName('bodyschild')[0].setAttribute('id', 'none')
    window.location.reload();
}
