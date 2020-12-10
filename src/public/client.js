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
            date: '',
            explanation: '',
            media_type: '',
            service_version: '',
            title: '',
            url: '',
        }),
    }),
    roverInfo: Immutable.List([Immutable.Map({
        name: '',
        landing_date: '',
        launch_date: '',
        status: '',
        photos: Immutable.List(Immutable.Map({
            img_src: '',
            date : '',
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

const returnInnerTabHTML = (name) => {
    return (`
        <li class="nav-item">
            <a class="nav-link active" href="#" onclick="onClick(this)" id="${name}">${name}</a>
        </li>
    `)
}

const displayTabs = (rovers) => {
    return (`
        <ul class="nav nav-tabs">
        ${rovers.map(rover => returnInnerTabHTML(rover)).join('')}
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

const displayRoverInfo = (whcRover,roverInfo) => {
    let rover = roverInfo.find(info => info['name'] === whcRover);
    console.log('in displayRoverInfo',roverInfo)
    if (rover) {
        return (
            `
            <div>Name: ${rover.name}</div>
            <div>Launch Date: ${rover.launch_date}</div>
            <div>Landing Date: ${rover.landing_date}</div>
            <div>Status: ${rover.status}</div>
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
            <section>
                ${displayTabs(rovers)}
                ${displayRoverInfo(currentTab,roverInfo)}                
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    // store.toJS().rovers.forEach((rover) => {
    //     var element = document.getElementById(rover.toLowerCase());
    //     element.onclick = () => {console.log(rover)}
    // })

    // var tag = document.createElement("ul");
    // var text = document.createListNode("Tutorix is the best e-learning platform");
    // tag.appendChild(text);
    // var element = document.getElementById("new");
    // element.appendChild(tag);

    // var list = document.createElement("UL");
    // list.setAttribute('class', 'nav nav-tabs');
    // var listItem = document.createElement("LI");
    // listItem.setAttribute('class', 'nav-item');
    // var hyperlink = document.createElement("A");
    // hyperlink.setAttribute('class', 'nav-link active');
    // hyperlink.setAttribute('href', '#');
    // hyperlink.innerHTML = "New text!";
    // listItem.appendChild(hyperlink);
    // list.appendChild(listItem);

    // var p = document.createElement('p');
    // p.innerHTML = "New text!";
    // root.appendChild(p);




    // var textnode=document.createTextNode(firstname);
    // node.appendChild(textnode);
    // document.getElementById("demo").appendChild(node);
    // root.appendChild(list);

    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }
    return `
        <h1>Hello!</h1>
    `
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
