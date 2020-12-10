require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
// const request = require('request');
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    console.log('in get request')
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/:id', async (req, res) => {
    try {
        let roverInfoObj = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.id}/?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        //need to gaurd against error
        const maxSol = roverInfoObj.photo_manifest.max_sol;
        // console.log("maxSol",maxSol);

        let photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.id}/photos?sol=${maxSol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        //need to gaurd against error

        // photos = photos.photos.map(photo => photo.id).sort((a, b) => b - a).slice(0,10);
        photos = photos.photos.sort((a, b) => b.id - a.id)
            .map((photoInfo) => {return {img_src : photoInfo.img_src, date: photoInfo.earth_date}})
            .slice(0,10);       

        returnObj = {
            name: roverInfoObj.photo_manifest.name,
            landing_date: roverInfoObj.photo_manifest.landing_date,
            launch_date: roverInfoObj.photo_manifest.launch_date,
            status: roverInfoObj.photo_manifest.status,
            photos: photos,
        }
        console.log(returnObj)
        res.send( returnObj )
    } catch (err) {
        console.log('error:', err);
    }
})

//https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=kPeWfUpnhB321Wq2i7GJgRuLn4nGAKxO0G9VSUM1


app.listen(port, () => console.log(`Example app listening on port ${port}!`))