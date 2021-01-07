//https://api.mapbox.com/geocoding/v5/mapbox.places/starbucks.json?bbox=-97.325875,%2049.766204,%20-96.953987,%2049.99275&access_token=pk.eyJ1IjoibmF2bmVldGthdXIxMTAxMDIiLCJhIjoiY2tqbGx6MXJ2NHFvbDJycDkzZTJtcnBldCJ9._8bFHYShajMmYkmTvZn-Ng&limit=10
//get the loactions 

//https://api.winnipegtransit.com/v3/trip-planner.json?api-key=2T4MALF1Wx9A3YtpUmKz&origin=addresses/136590&destination=intersections/123172:378@954
//get the segments 

const mapBoxApiKey = "pk.eyJ1IjoibmF2bmVldGthdXIxMTAxMDIiLCJhIjoiY2tqbGx6MXJ2NHFvbDJycDkzZTJtcnBldCJ9._8bFHYShajMmYkmTvZn-Ng";
const mapBoxBaseUrl = "https://api.mapbox.com/geocoding/v5/";
const winnipegCoords = "-97.325875,%2049.766204,%20-96.953987,%2049.99275";
const transitApiKey = "2T4MALF1Wx9A3YtpUmKz";
const transitBaseUrl = "https://api.winnipegtransit.com/v3/trip-planner.json?"

const originContainer = document.querySelector('.origin-container');
const originForm = document.querySelector('.origin-container .origin-form');
const originUL = document.querySelector('.origins');

const destinationContainer = document.querySelector('.destination-container');
const destinationForm = document.querySelector('.destination-form');
const destinationUL = document.querySelector('.destinations');

function fetchPlaces(placeName) {
  return fetch(`${mapBoxBaseUrl}mapbox.places/${placeName}.json?bbox=${winnipegCoords}&access_token=${mapBoxApiKey}&limit=10`)
    .then(data => data.json())
}

function printPlaceName( place, box) {
  box.insertAdjacentHTML('beforeend', 
  `<li data-long="${place.long}" data-lat="${place.lat}">
    <div class="name">${place.name}</div>
    <div>${place.address}</div>
  </li>`)

}

function manipulatePlacesData(places, box) {
  box.innerHTML = "";
  places.forEach(place => {
    const placeData = {
      'lat' : place.center[1],
      'long' : place.center[0],
      'name' : place.text,
      'address' : (place.properties.address !== undefined) ? `${place.properties.address}` : 'Winnipeg'
    }
    printPlaceName(placeData, box);
  })
}

function originFormFunctionality(event, box) {
  if(event.target.nodeName === "FORM"){
    const input = event.target.firstElementChild
    const placeName = input.value;
    input.value = "";
    fetchPlaces(placeName)
      .then((data) => {
        if(data.features.length === 0) {
          console.log("data not found")
        } else {
          manipulatePlacesData(data.features, box)
        }
      } )
  }
}

originForm.addEventListener('submit', (event) => {
  event.preventDefault();
  originFormFunctionality(event, originUL);
})

destinationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  originFormFunctionality(event, destinationUL);
})