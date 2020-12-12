//immutable js variable used for controlling state
let store = Immutable.Map({
    roverInfo: Immutable.List([Immutable.Map({
        name: String,
        landing_date: String,
        launch_date: String,
        status: String,
        maxSol : String,
        photos: Immutable.List(Immutable.Map({
            img_src: String,
            date : String,
        }))
    })]),
    currentTab: 'Curiosity',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    apiRequestError: '',
    displayLoadingMessage: false,
})

//function used to update state and rerender page
const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

//add our markup to the page
const root = document.getElementById('root')

//renders page
const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {

    let { rovers, roverInfo, currentTab, apiRequestError, displayLoadingMessage } = state.toJS();

    return `
        <header></header>
        <main>
            ${Greeting()}
            <section class="tab-content">
                ${displayTabs(rovers,currentTab)}
                ${displayRoverInfo(currentTab,roverInfo,apiRequestError,displayLoadingMessage)}
            </section>
        </main>
        <footer></footer>
    `
}

//listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

//handles tab button clicks
const onClick = (tabName) => {
    const currentTab = tabName.id;
    updateStore(store,{currentTab})
}

//handles random photos button click
const handleRandomButtonClick = (rover) => {
    updateStore(store,{displayLoadingMessage:true})
    const maxSol = store.toJS().roverInfo.find(info => info['name'] === rover.id).maxSol;
    fetch(`http://localhost:3000/roverPhotos/${rover.id}/${maxSol}`) 
    .then(res => res.json())
    .then((newPhotos) => {
        if (newPhotos.error) {
            const apiRequestError = newPhotos.error;
            updateStore(store,{apiRequestError})
        }
        const newStore = store.toJS()        
        const idx = store.toJS().roverInfo.findIndex(r => r.name == rover.id)
        newStore.roverInfo[idx].photos = newPhotos.photos;
        newStore.displayLoadingMessage = false;
        updateStore(store, newStore)
    })
    .catch(err => console.log(err))
}

const capatalizeString = (str) => {
    if (str) return str.slice(0,1).toUpperCase() + str.slice(1,str.length);
}

//displays greeting
const Greeting = () => {
    return(`        
        <div class="jumbotron">
        <h1 class="display-4">Udacity NASA</h1>
        <p class="lead">Welcome to Udacity NASA! Feel free to explore different NASA rover pictures and info! .</p>
        </div>
    `)
}

//handles displaying of tabs
const displayTabs = (rovers,currentTab) => {
    return (`
        <ul class="nav nav-tabs justify-content-center">
        ${rovers.map(rover => returnInnerTabHTML(rover,currentTab)).join('')}
        </ul>
    `)
}

//displays inner tab html
const returnInnerTabHTML = (name,currentTab) => {
    return (`
        <li class="nav-item">
            <a class="nav-link${name==currentTab?' active':''}" href="#" onclick="onClick(this)" id="${name}">${name}</a>
        </li>
    `)
}

//handles the displayment of the carousel 
const returnCarousel = (photos) => {
    return(`
           <div id="carouselExampleIndicators" class="carousel slide carousel-content" data-ride="carousel">
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

//displays carousel photo 
const returnCarouselPhoto = (photo,idx) => {
    return(`
        <div class="carousel-item${idx===0?' active':''}">
            <img class="d-block w-100" src=${photo.img_src} alt=${photo.date}>
            <div class="carousel-text">${photo.date}</div>
        </div>        
    `)
}

//displays carousel list item
const returnCarouselListItem = (idx) => {
    return(`
        <li data-target="#nextPicture" data-slide-to="${idx}"></li>
    `)
}

//displays loading message
const returnLoadingMessage = () => {
    return `<div class="loading-message">Loading...<div>`;
}

//checks to see if requested rover exists, if not performs API request to retrieve info
const displayRoverInfo = (whcRover,roverInfo,apiRequestError,displayLoadingMessage) => {
    let rover = roverInfo.find(info => info['name'] === whcRover);
    if (rover) {
        return (
            `
            <div class="jumbotron rover-info">            
            <p class="lead">Rover: ${rover.name}</p>
            <p class="lead">Launch Date: ${rover.launch_date}</p>
            <p class="lead">Landing Date: ${rover.landing_date}</p>
            <p class="lead">Status: ${capatalizeString(rover.status)}</p>
            <button type="button" class="btn btn-primary" onclick="handleRandomButtonClick(this)" id="${rover.name}">Get Random Photos</button>
            ${displayLoadingMessage ? returnLoadingMessage() : '' }
            </div>
            ${returnCarousel(rover.photos)}           
            `
        )
    } else if (apiRequestError === '') {
        fetch(`http://localhost:3000/rover/${whcRover}`) 
            .then(res => res.json())
            .then((roverInfo) => {
                if (roverInfo.error) {
                    updateStore(store,{apiRequestError:roverInfo.error})
                }
                let newStore = store.toJS()
                newStore.roverInfo.push(roverInfo);
                updateStore(store, newStore)
            })
            .catch(err => console.log(err))
        return returnLoadingMessage()
    } else {
        return `<div class="error-message">${apiRequestError}<div>`
    }
}