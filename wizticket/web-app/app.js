'use strict'

/* Web development libraries */
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const helmet = require('helmet')
const session = require('express-session')

/* Create express web application */
const app = express()

/* Make it usable */
var PORT = process.env.PORT || 3000

/* Get libraries to call */
var network = require('./network/network.js')
// var validate = require('./network/validate.js')
// var analysis = require('./network/analysis.js')

/* Bootstrap application settings */

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.set('view engine','ejs')
app.use(express.static('public'))
var sess = {
    secret: 'keyboard cat',
    cookie: {}
  }
  
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }
  
  app.use(session(sess))

app.listen(PORT,()=>{
    console.log('Listening on port',PORT,'....')
})

app.get('/',(req,res)=>{
    res.render('home.ejs')
    console.log(req.sessionID)
})

app.get('/fan',(req,res)=>{
    res.render('fan.ejs')
})

app.get('/fanregistration',(req,res)=>{
    res.render('fanregistration.ejs')
})

app.get('/artist',(req,res)=>{
    res.render('artist.ejs')
})

app.get('/artistregistration',(req,res)=>{
    res.render('artistregistration.ejs')
})

app.get('/eventowner',(req,res)=>{
    res.render('eventowner.ejs')
})

app.get('/eventownerregistration',(req,res)=>{
    res.render('eventownerregistration.ejs')
})

app.get('/place/new',(req,res)=>{
    var participant = {}
    participant.ESId = req.session.ESId
    participant.firstname = req.session.firstName
    participant.secondName = req.session.secondName
    participant.email = req.session.email
    participant.place = req.session.place
    res.render('placeform.ejs',{owner: participant})
})

/* POST REQUESTS */
app.post('/api/registerFan',(req,res)=>{
    var fanId = req.body.fanId
    var firstName = req.body.firstName
    var lastName = req.body.lastName
    var email = req.body.email
    console.log('params: ',fanId)
    network.registerFan(fanId,firstName,lastName,email).then((response)=>{
        if(response.error!=null) {
            res.json({
                error: response.error
            })
        } else{
            res.json({
                success: response
            })
        }
    })
})

app.post('/api/registerArtist',(req,res)=>{
    var artistId = req.body.artistId
    var firstName = req.body.firstname
    var lastName = req.body.lastname
    var email = req.body.email
    console.log('params: ',artistId)
    network.registerArtist(artistId,firstName,lastName,email).then((response)=>{
        if(response.error!=null){
            res.json({
                error: response.error
            })
        } else {
            res.json({
                success: response
            })
        }
    })
})

app.post('/api/registerOwner',(req,res)=>{
    var ESId = req.body.ESId
    var firstName = req.body.firstname
    var lastName = req.body.lastname
    var email = req.body.email
    console.log('params: ',ESId)
    network.registerOwner(ESId,firstName,lastName,email).then((response)=>{
        if(response.error!=null){
            res.json({
                error: response.error
            })
        } else {
            res.json({
                success: response
            })
        }
    })
})

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  

app.post('/api/registerES',(req,res)=>{
    var seats = req.body.seating.split(',')
    var seating = []
    for (var i = 0; i < seats.length;i++) {
        seating.push(parseInt(seats[i]))
    }
    network.registerES(uuidv4(),req.body.name,req.body.description,req.body.city,req.body.country,req.body.region,req.body.street,req.body.postalcode,seating,req.body.ESId).then((response)=>{
        if(response.error!=null){
            res.json({
                error: response.error
            })
        } else {
            res.json({
                success: response
            })
        }
    })
})

app.get('/home',(req,res)=>{
    var participant = {}
    if (req.session.fanId != null){
        participant.fanId = req.session.fanId
        participant.firstname = req.session.firstName
        participant.secondName = req.session.secondName
        participant.email = req.session.email
        participant.events = req.session.events
        res.render('dashboard.ejs',{participant: participant})
    } else if (req.session.artistId != null){
        participant.artistId = req.session.artistId
        participant.firstname = req.session.firstName
        participant.secondName = req.session.secondName
        participant.email = req.session.email
        participant.events = req.session.events
        console.log(participant)
        res.render('artistdashboard.ejs',{artist: participant})
    } else if (req.session.ESId != null) {
        participant.ESId = req.session.ESId
        participant.firstname = req.session.firstName
        participant.secondName = req.session.secondName
        participant.email = req.session.email
        participant.place = req.session.space
        console.log(participant)
        res.render('ownerdashboard.ejs',{owner: participant})
    }
    
})

app.post('/api/fanData',(req,res)=>{
    var fanId = req.body.fanId
    var cardId = req.body.cardId
    var returnData = {}
    network.FanData(fanId,cardId).then((fan) => {
        if(fan.error != null){
            res.json({
                error: fan.error
            })
        } else {     
            req.session.fanId = fan.fanId
            req.session.firstName = fan.information.firstname
            req.session.secondName = fan.information.lastName
            req.session.email = fan.information.email   
        }
    }).then(()=>{
        network.showAllEvents(cardId).then((events)=>{
            if (events.error != null ){
                res.json({
                    error: events.error
                })
            } else {
                req.session.events = events
                res.redirect('/home')
            }
        })
    }).catch((error)=>{
        console.log(error)
    })
})


app.post('/api/artistData',(req,res)=>{
    var artistId = req.body.artistId
    var cardId = req.body.cardId
    console.log(artistId,cardId)
    var returnData = {}
    network.ArtistData(artistId,cardId).then((fan) => {
        if(fan.error != null){
            res.json({
                error: fan.error
            })
        } else {     
            req.session.artistId = fan.artistId
            req.session.firstName = fan.information.firstname
            req.session.secondName = fan.information.lastname
            req.session.email = fan.information.email   
        }
    }).then(()=>{
        network.showAllEvents(cardId).then((events)=>{
            if (events.error != null ){
                res.json({
                    error: events.error
                })
            } else {
                req.session.events = events
                res.redirect('/home')
            }
        })
    }).catch((error)=>{
        console.log(error)
    })
})

app.post('/api/OwnerData',(req,res)=>{
    var ESId = req.body.ESId
    var cardId = req.body.cardId
    console.log(ESId,cardId)
    var returnData = {}
    network.OwnerData(ESId,cardId).then((fan) => {
        if(fan.error != null){
            res.json({
                error: fan.error
            })
        } else {     
            req.session.ESId = fan.ESId
            req.session.firstName = fan.information.firstname
            req.session.secondName = fan.information.lastname
            req.session.email = fan.information.email   
        }
    }).then(()=>{
        network.showAllEventSpaces(cardId).then((events)=>{
            console.log(events)
            if (events.error != null ){
                res.json({
                    error: events.error
                })
            } else {
                req.session.space = events
                res.redirect('/home')
            }
        })
    }).catch((error)=>{
        console.log(error)
    })
})