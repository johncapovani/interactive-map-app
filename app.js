//Create a mapData Object that stores methods, variables, which will be used to create a dynamic map

const mapObject = {

    coordinates: [],
    map: {},
    markers: {},
    searchResults: [],

    //To build the map you use this.coordinates to reference the event that invoked the function

    buildMap() {

        //Set up the map
        this.map = L.map('map', {
            //Create a function that will use the GEO location API to get the location and parse that value in
            center: this.coordinates,
            zoom: 11,
        });
        //Add tiles that display the landscape images
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 50,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        //Add geolocation popup

        let geoLocation = L.marker(this.coordinates).addTo(this.map)
        geoLocation.bindPopup("<b>Hello world!</b><br>I was lost, but now I am found.").openPopup();

    },

    searchResultsMarkerGenerater() {

        this.markers.forEach((results) => {

            this.markers = L.marker([

                results.locationLat,
                results.locationLong,

            ])
                .bindPopup(`<p1>${results.locationName}</p1>`)
                .addTo(this.map)

        })
        console.log(this.markers)
    },
}

async function getCoordinates() {

    let userLocation = await new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(resolve, reject)

    })

    // latitude [0], longitude [1] this array will be set to the maps cordinates onStart
    return [userLocation.coords.latitude, userLocation.coords.longitude]

}



// //Request query search will pull search results for either businesses or categories selected by user
async function getSearchResults(searchValue) {

    const requestConfig = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8='
        }
    }

    //Query configuration settings

    let searchLimit = 10
    //Pulls coordinates from that map which have already been defined upon page load
    //First index is the latitude
    let latitudeCoord = mapObject.coordinates[0]
    //Second index is the longitude
    let longitudeCoord = mapObject.coordinates[1]

    //requestConfig includes the request type parameters including authorizaiton etc
    let searchResult = await fetch(`https://api.foursquare.com/v3/places/search?&query=${searchValue}&limit=${searchLimit}&ll=${latitudeCoord}%2C${longitudeCoord}`, requestConfig)

    // let searchResult = await fetch('https://api.foursquare.com/v3/places/search?query=food', requestConfig)
    let searchResultData = await searchResult.text()

    //Parse JSON data
    let parseSearchResultData = JSON.parse(searchResultData)

    let finalData = parseSearchResultData.results

    return finalData


}



//Analyze the list of results, create a object that includes each results longitude, latitude, and name
function analyzeResults(rawData) {

    //map loops through each array element
    let searchResults = rawData.map((element) => {


        let results = {

            locationName: element.name,
            locationLat: element.geocodes.main.latitude,
            locationLong: element.geocodes.main.longitude

        };
        return results
    })
    return searchResults
}

//INITIATING THE FUNCTIONS//



//On page load function

window.onload =
    async () => {

        const coords = await getCoordinates()
        mapObject.coordinates = coords
        mapObject.buildMap()


    }

//Business submit button event listner creation which will invoke the get business API request,
//process businesses method, and add business markers function


// business submit button
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault()


    let business = `${document.getElementById('business').value} ${document.getElementById('searchbar').value}`
    //Passing the resulting data into the proces Business function
    let data = await getSearchResults(business)
    mapObject.markers = analyzeResults(data)
    mapObject.searchResultsMarkerGenerater()

})


