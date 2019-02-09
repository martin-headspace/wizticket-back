'use strict'

/* Web development libraries */
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const helmet = require('helmet')

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

app.listen(PORT,()=>{
    console.log('Listening on port',PORT,'....')
})

app.get('/',(req,res)=>{
    res.render('home.ejs')
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
    console.log('params: ',artistId)
    network.registerFan(artistId).then((response)=>{
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
            returnData.fanId = fan.fanId
            returnData.firstName = fan.information.firstname
            returnData.secondName = fan.information.secondName
            returnData.email = fan.information.email
            console.log(returnData)
        }
    }).then(()=> {
        network.showAllEvents(cardId).then((events)=>{
            if(events.error != null){
                res.json({
                    error: events.error
                })
            } else {
                returnData.events = events
            }
            
            res.json(returnData)
        })
    })
})