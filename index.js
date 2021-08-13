const express = require('express')
const mysql = require('mysql');
const crypto = require('crypto')
const path = require('path');
const bodyParser = require('body-parser');
const { Console } = require('console');
var userid;

var userid
const app = express();

app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded())
app.use(express.json())
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hitesh@2001',
    database: 'signup'
});
db.connect((err) => {
    if (err) throw err;
    else console.log('connected to database')
})
app.get('/', (req, res) => {
    console.log('opened signup page')
    res.sendFile(__dirname + '//public/successfullogin.html')
});
function createsignuptable(req, res) {
    const querytocreatesignuptable = 'CREATE TABLE signupmap (emailid NVARCHAR(320) UNIQUE NOT NULL, passwordofemailid VARCHAR(32) );'
    db.query(querytocreatesignuptable, (errincreationsignupmap, result) => {
        if (errincreationsignupmap) console.log(errincreationsignupmap.sqlMessage)
    })
}
function emailappendingfunc(req, res) {
    createsignuptable();
    var emailidparsed = req.body.email;
    console.log(emailidparsed)
    var passwordparsed = crypto.createHash('md5').update(req.body.password).digest('hex');
    var querytocheckifalredyregistered = 'SELECT passwordofemailid FROM signupmap WHERE emailid="' + req.body.email + '";'
    db.query(querytocheckifalredyregistered, (err, result) => {
        if(typeof(result[0]) == 'undefined'){
            var querytoaddemailandpass = "INSERT INTO signupmap (emailid, passwordofemailid) VALUES('" + emailidparsed + "', '" + passwordparsed + "');";
            console.log(querytoaddemailandpass)
            db.query(querytoaddemailandpass, (errinemailaddition, result) => {
                if (errinemailaddition) res.send({ status: '!exist' })
                querytocreatevotedpolls = 'CREATE TABLE `' + emailidparsed + 'voted`(votedpolls VARCHAR(32))'
                db.query(querytocreatevotedpolls, (errtocreatevotedpolls, result) => {
                    if(errtocreatevotedpolls) console.log(errtocreatevotedpolls.sqlMessage)
                })
                res.send({ status: 'ok' })
            })
        }
        else{
            res.send({status: '!exist'})
        }
    })
}
function login(req, res) {
    createsignuptable();
    querytocreatevotedpolls = 'CREATE TABLE `' + req.body.email + 'voted`(votedpolls VARCHAR(32))'
    db.query(querytocreatevotedpolls, (errtocreatevotedpolls, result) => {
        if(errtocreatevotedpolls) console.log(errtocreatevotedpolls.sqlMessage)
    })
    var passwordparsed = crypto.createHash('md5').update(req.body.password).digest('hex');
    var querytologin = `SELECT passwordofemailid FROM signupmap WHERE emailid = '${req.body.email}';`
    db.query(querytologin, (errinlogin, result) => {
        if (errinlogin) console.log(errinlogin.sqlMessage)
        else if (result[0] == undefined) res.send({ status: '!exist' })
        else if (passwordparsed == result[0]['passwordofemailid']) {
            res.send({passwordparsed, status: 'ok' })
        }
        else res.send({ status: 'invalidcredentials' })
    })
}
function teamcreation(req, res) {
    querytocreateteam = 'CREATE TABLE teams( admin NVARCHAR(320), teamnamewithmail NVARCHAR(320) UNIQUE, teamname VARCHAR(100));'
    db.query(querytocreateteam, (errorincreatingteam, result) => {
        if(errorincreatingteam) console.log(errorincreatingteam.sqlMessage)
        querytoaddadminandteamname = 'INSERT INTO teams VALUES("' + req.body.email + '", "' + req.body.teamname + req.body.email + '", "' + req.body.teamname + '");'
        console.log(querytoaddadminandteamname)
        db.query(querytoaddadminandteamname, (errtoaddadminandteamname, result) => {
            if(errtoaddadminandteamname) console.log(errtoaddadminandteamname.sqlMessage)
            else res.send({fallout: 'success'})
        })
    })
    queryforpollsinteam = 'CREATE TABLE `' + req.body.teamname + req.body.email + '`(hashedquestions VARCHAR(32));'
    db.query(queryforpollsinteam, (errincreatingpollstable, result) => {
        if(errincreatingpollstable) console.log(errincreatingpollstable.sqlMessage)
    })
}
function createpolltable(question, userid) {
    questionhash = crypto.createHash('md5').update(question + userid).digest('hex');
    const querytocreatepolltable = 'CREATE TABLE `' + questionhash + '`(`' + question + '` VARCHAR(200), vote INT);'
    db.query(querytocreatepolltable, (errorincreatepolltable, result) => {
        if (errorincreatepolltable) console.log(errorincreatepolltable.sqlMessage)
    })
}
function createpoll(req, res) {
    userid = req.body.email
    var questionhash = crypto.createHash('md5').update(req.body.question + userid).digest('hex');
    createpolltable(req.body.question, userid)
    db.query('INSERT INTO `' + req.body.teamnameandmail + '` values("' + questionhash + '")')
    for (let i = 0; i < req.body.optioninput.length - 1; i++) {
        var querytoappendpolloptions = 'INSERT INTO `' + questionhash + '` VALUES("' + req.body.optioninput[i] + '", 0);'
        db.query(querytoappendpolloptions, (errinappendingpolloptions, result) => {
            if (errinappendingpolloptions) console.log(errinappendingpolloptions.sqlMessage)
        })
    }
}
function inviteuser(req, res) {
    emailtoinvite = req.body.invitee
    console.log('invite ran successfully ' + emailtoinvite + req.body.teamname)
    var querytocreateinvitetable = "CREATE TABLE `invites" + emailtoinvite + "`(invitedteam NVARCHAR(320), status VARCHAR(10), teamnamewithmail NVARCHAR(320) UNIQUE);"
    db.query(querytocreateinvitetable, (errortocreateinviteestable, result) => {
        if (errortocreateinviteestable) console.log(errortocreateinviteestable.sqlMessage)
        var querytoappendtoinviteestable = "INSERT INTO `invites" + emailtoinvite + "` VALUES('" + req.body.teamname + "', 'pending', '" + req.body.teamname + req.body.email + "');"
        db.query(querytoappendtoinviteestable, (errorinappendingtoinviteestable) => {
            if(errorinappendingtoinviteestable) console.log("errorininvite" + errorinappendingtoinviteestable.sqlMessage)
            else res.send({fallout: 'success'})
            })
    })
}

function refreshinvitations(req, res) {
    console.log('good until refreshinvitations')
    querytogetinvites = "SELECT * FROM `invites" + req.body.email + "` WHERE status='" + req.body.flag + "';"
    var arrayofinvites = []
    let counterone
    let countertwo = 0
    db.query(querytogetinvites, (errtogetinvites, result) => {
        if(errtogetinvites) console.log(errtogetinvites.sqlMessage)
        res.send({result})
    })
}
function refreshingcreatedteams(req, res) {
    email = req.body.email
    arrayofcreatedpolls = []
    let counterone;
    let countertwo = 0;
    querytogetcreatedteams = "SELECT * FROM teams WHERE admin = '" + email + "'";
    db.query(querytogetcreatedteams, (errtogetcreatedteams, result) => {
        if(errtogetcreatedteams) console.log(errtogetcreatedteams.sqlMessage)
        res.send({result})
    })
}
function invititionadder(req, res){
    email = req.body.email;
    teamtoadd = req.body.invititionteamtoadd
    querytoaddtoinvites = 'UPDATE `invites' + email + '` SET status="accepted" WHERE invitedteam="' + teamtoadd + '";'
    db.query(querytoaddtoinvites, (errtoaddtoinvites) => {
        if(querytoaddtoinvites) console.log(querytoaddtoinvites.sqlMessage)
        res.send({fallout: 'success'})
    })
}
function getpolls(req, res){ 
    quertytogethashofpolls = 'SELECT * FROM `' + req.body.clickeddivid + '`;'
    db.query(quertytogethashofpolls, (errtogethashofpolls, result) => {
        if(errtogethashofpolls) console.log(errtogethashofpolls.sqlMessage)
        var arrayofhashedquestions = []
        for (let i = 0; i < result.length; i++) {
            arrayofhashedquestions.push(result[i].hashedquestions)
        }
        console.log(arrayofhashedquestions)
        pollstosend = []
        for (let j = 0; j < arrayofhashedquestions.length; j++) {
            quertytogetpollsfromhash = 'SELECT * FROM `' + arrayofhashedquestions[j] + '`;'
            db.query(quertytogetpollsfromhash, (errtogetpollsfromhash, result) => {
                if(errtogetpollsfromhash) console.log(errtogetpollsfromhash.sqlMessage)
                pollstosend.push(result);
                if(pollstosend.length == arrayofhashedquestions.length) res.send({arrayofhashedquestions, pollstosend})
            })
        }
    })
}
// function checkifalredyvoted(email, poll, res){
//     querytocheckifalredyvoted = 'SELECT * FROM `' + req.body.email + 'voted` WHERE votedpoll = "' + poll + '";'
//     db.query(querytocheckifalredyvoted, (err, result) => {
//         if(err) {
//             console.log(err.sqlMessage)
//             res.send({status: "already voted"})
//         }
//     })
// }
function vote(req, res){
    querytocheckifalredyvoted = 'SELECT * FROM `' + req.body.email + 'voted` WHERE votedpolls = "' + req.body.poll + '";'
    console.log(querytocheckifalredyvoted)
    db.query(querytocheckifalredyvoted, (err, resultt) => {
        // console.log(typeof(resultt) == 'undefined')
        if(typeof(resultt[0]) == 'undefined') {
            console.log('entered in if loop')
            querytogetquestion = 'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS  WHERE TABLE_NAME = "'+ req.body.poll + '" ORDER BY ORDINAL_POSITION ;'
            db.query(querytogetquestion, (errtogetquestion, result) => {
                if(errtogetquestion) console.log(errtogetquestion.sqlMessage);
                console.log(result)
                querytoaddvote = 'UPDATE `' + req.body.poll + '` SET vote = vote + 1 WHERE `' + result[0].COLUMN_NAME + '` = "' + req.body.optionchosen + '";'
                db.query(querytoaddvote, (errtoaddvote, result) => {
                    if(errtoaddvote) console.log(errtoaddvote.sqlMessage)
                })
                querytoaddtovoted = 'INSERT INTO `' + req.body.email + 'voted` VALUES("' + req.body.poll + '");'
                db.query(querytoaddtovoted, (err, result) => {
                    if(err) console.log(err.sqlMessage)
                })
            })
        }
        else{
            res.send({status: "already voted"})
        }
    })
}
function endpoll(req, res){
    querytorenamevotecol = 'ALTER TABLE `' + req.body.poll + '` RENAME COLUMN vote TO ended;'
    db.query(querytorenamevotecol, (err, result) => {
        if(err) console.log(err.sqlMessage)
    })
}

app.get('/createsignuptable', createsignuptable);
app.post('/emailappendingfunc', emailappendingfunc);
app.post('/login', login);
app.post('/teamcreation', teamcreation)
app.post('/createpoll', createpoll);
app.post('/inviteuser', inviteuser);
app.post('/refreshinvitations', refreshinvitations);
app.post('/refreshingcreatedteams', refreshingcreatedteams)
app.post('/invititionadder', invititionadder);
app.post('/getpolls', getpolls)
app.post('/vote', vote)
app.post('/endpoll', endpoll)

app.listen('3001', (req, res) => {
    console.log('server started at 3001')
});


// function refreshinvitationspromise(req, res){
//     return new Promise( (success, failure) => {
//         querytogetinvites = "SELECT * FROM `invites" + req.body.email + "`;"
//         console.log(querytogetinvites)
//         var arrayofinvites = []
//         db.query(querytogetinvites, (errtogetinvites, result) => {
//             for (let i = 0; i < result.length; i++) {
//                 var querytogetquestionname = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + result[i]['invitedteam'] + "' ORDER BY ORDINAL_POSITION;"
//                 db.query(querytogetquestionname, (errtogetquestionname, result) => {
//                     if(errtogetquestionname) console.log(errtogetquestionname.sqlMessage)
//                     console.log(result)
//                     arrayofinvites.push(result[0].COLUMN_NAME)
//                 })
//             }
//         })
//         setTimeout(() => {
//             success(arrayofinvites)
//         }, 1000);
//     });
// }