require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

//endpoint for initial rover data
app.get('/rover/:id', async (req, res) => {
    try {
        let returnObj = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.id}/?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
            .catch(err => console.log(err))
        
        //in case of error, send message to client
        if (returnObj.error) {
            res.send({error:returnObj.error.message})
            return
        }
        
        //request photos based on max sol
        const maxSol = returnObj.photo_manifest.max_sol;
        let photos = await getPhotosBySol(req.params.id,maxSol);        
        const sortedPhotos = sortByLatestSolPhotoDate(photos.photos);

        //return data to client
        returnObj = {
            name: returnObj.photo_manifest.name,
            landing_date: returnObj.photo_manifest.landing_date,
            launch_date: returnObj.photo_manifest.launch_date,
            status: returnObj.photo_manifest.status,
            photos: sortedPhotos,
            maxSol: maxSol,
        }
        res.send( returnObj )
    } catch (err) {console.log('error:', err);}
})

//endpoint for users to request random photos
app.get('/roverPhotos/:id/:sol', async (req, res) => {
    const randSol = Math.floor(Math.random()*req.params.sol);
    const photos = await getPhotosBySol(req.params.id,randSol);        
    const sortedPhotos = sortByLatestSolPhotoDate(photos.photos);
    res.send({photos : sortedPhotos})
})

//get photos based on sol
const getPhotosBySol = async (id,sol) => {
    let photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${id}/photos?sol=${sol}&api_key=${process.env.API_KEY}`)
        .then(res => res.json())
    return photos;
}

//sort photo information, only include latest 10 photos
const sortByLatestSolPhotoDate = (photos) => {
    try {
        return photos.sort((a, b) => b.id - a.id)
            .map((photoInfo) => {return {img_src : photoInfo.img_src, date: photoInfo.earth_date}})
            .slice(0,10);   
    } catch (err) {console.log('error:', err);}
}

//https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=kPeWfUpnhB321Wq2i7GJgRuLn4nGAKxO0G9VSUM1

app.listen(port, () => console.log(`Example app listening on port ${port}!`))