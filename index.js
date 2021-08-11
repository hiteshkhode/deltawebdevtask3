const express = require('express')
const mysql = require('mysql');
const crypto = require('crypto')
const path = require('path');
const bodyParser = require('body-parser');
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
    var passwordparsed = crypto.createHash('md5').update(req.body.password).digest('hex');
    var querytoaddemailandpass = "INSERT INTO signupmap (emailid, passwordofemailid) VALUES('" + emailidparsed + "', '" + passwordparsed + "');";
    db.query(querytoaddemailandpass, (errinemailaddition, result) => {
        if (errinemailaddition) res.send({ status: '!exist' })
        res.send({ status: 'ok' })
    })
}
function login(req, res) {
    createsignuptable();
    var passwordparsed = crypto.createHash('md5').update(req.body.password).digest('hex');
    var querytologin = `SELECT passwordofemailid FROM signupmap WHERE emailid = '${req.body.email}';`
    db.query(querytologin, (errinlogin, result) => {
        if (errinlogin) console.log(errinlogin.sqlMessage)
        else if (result[0] == undefined) res.send({ status: '!exist' })
        else if (passwordparsed == result[0]['passwordofemailid']) res.send({passwordparsed, status: 'ok' })
        else res.send({ status: 'invalidcredentials' })
    })
}
function teamcreation(req, res) {
    querytocreateteam = 'CREATE TABLE teams( admin NVARCHAR(320), teamname VARCHAR(32) UNIQUE);'
    db.query(querytocreateteam, (errorincreatingteam, result) => {
        if(errorincreatingteam) console.log(errorincreatingteam.sqlMessage)
        querytoaddadminandteamname = 'INSERT INTO teams VALUES("' + req.body.email + '", "' + req.body.email + req.body.teamname + '");'
        console.log(querytoaddadminandteamname)
        db.query(querytoaddadminandteamname, (errtoaddadminandteamname, result) => {
            if(errtoaddadminandteamname) console.log(errtoaddadminandteamname.sqlMessage)
            else res.send({fallout: 'success'})
        })
    })
}
function createpolltable(question) {
    questionhash = crypto.createHash('md5').update(question).digest('hex');
    const querytocreatepolltable = 'CREATE TABLE `' + questionhash + '`(`' + question + '` VARCHAR(200), vote INT);'
    db.query(querytocreatepolltable, (errorincreatepolltable, result) => {
        if (errorincreatepolltable) console.log(errorincreatepolltable.sqlMessage)
    })
    const querytocreateallpollstable = `CREATE TABLE polls(pollid VARCHAR(32), admin NVARCHAR(230));`
    db.query(querytocreateallpollstable, (errtocreateallpollstable, result) => {
    })
}
function createpoll(req, res) {
    userid = req.body.email
    var questionhash = crypto.createHash('md5').update(req.body.question).digest('hex');
    createpolltable(req.body.question)
    db.query('INSERT INTO polls values("' + questionhash + '" , "' + userid + '")')
    for (let i = 0; i < req.body.optioninput.length; i++) {
        var querytoappendpolloptions = 'INSERT INTO `' + questionhash + '` VALUES("' + req.body.optioninput[i] + '", 0);'
        db.query(querytoappendpolloptions, (errinappendingpolloptions, result) => {
            if (errinappendingpolloptions) console.log(errinappendingpolloptions.sqlMessage)
        })
    }
}
function inviteuser(req, res) {
    emailtoinvite = req.body.invitee
    console.log('invite ran successfully ' + emailtoinvite + req.body.teamname)
    var querytocreateinvitetable = "CREATE TABLE `invites" + emailtoinvite + "`(invitedteam VARCHAR(32) UNIQUE);"
    db.query(querytocreateinvitetable, (errortocreateinviteestable, result) => {
        if (errortocreateinviteestable) console.log(errortocreateinviteestable.sqlMessage)
        var querytoappendtoinviteestable = "INSERT INTO `invites" + emailtoinvite + "` VALUES('" + req.body.teamname + req.body.email + "');"
        db.query(querytoappendtoinviteestable, (errorinappendingtoinviteestable) => {
            if(errorinappendingtoinviteestable) console.log("errorininvite" + errorinappendingtoinviteestable.sqlMessage)
            else res.send({fallout: 'success'})
            })
    })
}

function refreshinvitations(req, res) {
    console.log('good until refreshinvitations')
    querytogetinvites = "SELECT * FROM `invites" + req.body.email + "`;"
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
    querytogetcreatedteams = "SELECT teamname FROM teams WHERE admin = '" + email + "'";
    db.query(querytogetcreatedteams, (errtogetcreatedteams, result) => {
        if(errtogetcreatedteams) console.log(errtogetcreatedteams.sqlMessage)
        res.send({result})
    })
    // db.query(querytogetcreatedteams, (errtogetcreatedteams, result) => {
    //     if(errtogetcreatedteams) console.log(errtogetcreatedteams.sqlMessage);
    //     counterone = result.length
    //     for (let i = 0; i < result.length; i++) {
    //         arrayofcreatedpolls.push(result[i].pollid)
    //         countertwo += 1
    //     }
    //     if(countertwo == counterone) {
    //         // res.send({arrayofcreatedpolls})
    //         var arraytosend = []
    //         let firstcounter = 0;
    //         for (let i = 0; i < arrayofcreatedpolls.length; i++) {
    //             querytogetquestiontable = "SELECT * FROM `" + arrayofcreatedpolls[i] + "`;"
    //             db.query(querytogetquestiontable, (erringettingquestiontables, result) => {
    //                 if(erringettingquestiontables) console.log(erringettingquestiontables.sqlMessage)
    //                 arraytosend.push(result)
    //                 firstcounter += 1
    //                 if(firstcounter === arrayofcreatedpolls.length) res.send(arraytosend)
    //             })
    //         }
    //     }
    // })
}

app.get('/createsignuptable', createsignuptable);
app.post('/emailappendingfunc', emailappendingfunc);
app.post('/login', login);
app.post('/teamcreation', teamcreation)
app.post('/createpoll', createpoll);
app.post('/inviteuser', inviteuser);
app.post('/refreshinvitations', refreshinvitations);
app.post('/refreshingcreatedteams', refreshingcreatedteams)

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