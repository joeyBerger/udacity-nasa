//Udacity example
// let store = {
//     user: { name: "Student" },
//     apod: '',
//     rovers: ['Curiosity', 'Opportunity', 'Spirit'],
// }

// const updateStore = (store, newState) => {
//     console.log(newState)
//     store = Object.assign(store, newState)
//     render(root, store)
// }
//Udacity example

//my code
let store = Immutable.Map({
    user: Immutable.Map({ 
        name: "Student",
    }),
    apod: Immutable.Map({
        image: Immutable.Map({
            date: String,
            explanation: String,
            media_type: String,
            service_version: String,
            title: String,
            url: String,
        }),
    }),
    roverInfo: Immutable.List([Immutable.Map({
        name: String,
        landing_date: String,
        launch_date: String,
        status: String,
        photos: Immutable.List(Immutable.Map({
            img_src: String,
            date : String,
        }))
    })]),
    currentTab: 'Curiosity',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentTab : 'Curiosity',
})

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}
//my code


// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const onClick = (tabName) => {
    const currentTab = tabName.id;
    updateStore(store,{currentTab})
}

const returnInnerTabHTML = (name,currentTab) => {
    return (`
        <li class="nav-item">
            <a class="nav-link${name==currentTab?' active':''}" href="#" onclick="onClick(this)" id="${name}">${name}</a>
        </li>
    `)
}

const displayTabs = (rovers,currentTab) => {
    return (`
        <ul class="nav nav-tabs">
        ${rovers.map(rover => returnInnerTabHTML(rover,currentTab)).join('')}
        </ul>
    `)
}

const returnCarouselListItem = (idx) => {
    return(`
        <li data-target="#carouselExampleIndicators" data-slide-to="${idx}"></li>
    `)
}

const returnCarouselPhoto = (photo,idx) => {
    return(`
        <div class="carousel-item${idx===0?' active':''}">
            <img class="d-block w-100" src=${photo.img_src} alt=${photo.date}>
            <div class="carousel-content">${photo.date}</div>
        </div>
        
    `)
}

const returnCarousel = (photos) => {
    return(`
           <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">
            ${photos.map((photo,i) => returnCarouselListItem(i)).join('')}
            </ol>
            <div class="carousel-inner">
            ${photos.map((photo,i) => returnCarouselPhoto(photo,i)).join('')}
            </div>
            <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
            </a>
        </div>        
    `)
}

const capatalizeString = (str) => {
    if (str) return str.slice(0,1).toUpperCase() + str.slice(1,str.length);
}

const displayRoverInfo = (whcRover,roverInfo) => {
    let rover = roverInfo.find(info => info['name'] === whcRover);
    if (rover) {
        return (
            `
            <div class="rover-info">
            <div>Rover: ${rover.name}</div>
            <div>Launch Date: ${rover.launch_date}</div>
            <div>Landing Date: ${rover.landing_date}</div>
            <div>Status: ${capatalizeString(rover.status)}</div>
            </div>
            ${returnCarousel(rover.photos)}           
            `
        )
    } else {
        fetch(`http://localhost:3000/rover/${whcRover}`) 
            .then(res => res.json())
            .then((roverInfo) => {
                let newStore = store.toJS()
                newStore.roverInfo.push(roverInfo);
                updateStore(store, newStore)
            })
            .catch(err => console.log(err))
        return `Loading...`
    }
}

// create content
const App = (state) => {
    // let { rovers, apod } = state

    let { rovers, apod, user, roverInfo, currentTab } = state.toJS();
    console.log(state)

    return `
        <header></header>
        <main>
            ${Greeting(user.name)}
            <section class="tab-content">
                ${displayTabs(rovers,currentTab)}
                ${displayRoverInfo(currentTab,roverInfo)}                
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    return(`
        
        <div class="jumbotron">
        <h1 class="display-4">Udacity NASA</h1>
        <p class="lead">Welcome to Udacity NASA! Feel free to explore different NASA rover pictures and info! .</p>
        
        </div>
    `)
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    // if (!apod || apod.image.date === today.getDate() ) {
    if (apod.image.date === '' || apod.image.date === today.getDate() ) {        
        getImageOfTheDay(store)
    }

    // return(
    //     `   <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
    //         <ol class="carousel-indicators">
    //         <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
    //         <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
    //         <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
    //         </ol>
    //         <div class="carousel-inner">
    //         <div class="carousel-item active">
    //             <img class="d-block w-100" src="https://i.pinimg.com/originals/54/7a/9c/547a9cc6b93e10261f1dd8a8af474e03.jpg" alt="First slide">
    //         </div>
    //         <div class="carousel-item">
    //             <img class="d-block w-100" src="https://i.pinimg.com/originals/54/7a/9c/547a9cc6b93e10261f1dd8a8af474e03.jpg" alt="Second slide">
    //         </div>
    //         <div class="carousel-item">
    //             <img class="d-block w-100" src="https://wonderfulengineering.com/wp-content/uploads/2016/01/cool-wallpaper-6.jpg" alt="Third slide">
    //         </div>
    //         </div>
    //         <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
    //         <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    //         <span class="sr-only">Previous</span>
    //         </a>
    //         <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
    //         <span class="carousel-control-next-icon" aria-hidden="true"></span>
    //         <span class="sr-only">Next</span>
    //         </a>
    //     </div>
    //     `
    // )

    // check if the photo of the day is actually type video!
    if (apod.image && apod.image.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.image.url}">here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.explanation}</p>
        `)
    } else if (apod.image) {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    return ''
    let { apod } = state
    console.log('getImageOfTheDay')
    // fetch(`http://localhost:3000/apod`)
    fetch(`http://localhost:3000/rover/Curiosity`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
        .catch(err => console.log(err))

    // return data
}
