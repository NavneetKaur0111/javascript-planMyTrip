//https://api.mapbox.com/geocoding/v5/mapbox.places/starbucks.json?bbox=-97.325875,%2049.766204,%20-96.953987,%2049.99275&access_token=pk.eyJ1IjoibmF2bmVldGthdXIxMTAxMDIiLCJhIjoiY2tqbGx6MXJ2NHFvbDJycDkzZTJtcnBldCJ9._8bFHYShajMmYkmTvZn-Ng&limit=10
//get the loactions

//https://api.winnipegtransit.com/v3/trip-planner.json?api-key=2T4MALF1Wx9A3YtpUmKz&origin=addresses/136590&destination=intersections/123172:378@954
//get the segments

const mapBoxApiKey =
  "pk.eyJ1IjoibmF2bmVldGthdXIxMTAxMDIiLCJhIjoiY2tqbGx6MXJ2NHFvbDJycDkzZTJtcnBldCJ9._8bFHYShajMmYkmTvZn-Ng";
const mapBoxBaseUrl = "https://api.mapbox.com/geocoding/v5/";
const winnipegCoords = "-97.325875,%2049.766204,%20-96.953987,%2049.99275";
const transitApiKey = "2T4MALF1Wx9A3YtpUmKz";
const transitBaseUrl = "https://api.winnipegtransit.com/v3/trip-planner.json?";

const originContainer = document.querySelector(".origin-container");
const originForm = document.querySelector(".origin-container .origin-form");
const originUL = document.querySelector(".origins");

const destinationContainer = document.querySelector(".destination-container");
const destinationForm = document.querySelector(".destination-form");
const destinationUL = document.querySelector(".destinations");

const planButton = document.querySelector(".button-container");
const busContainer = document.querySelector(".bus-container");
const recommendedTrip = document.querySelector(".recommend-trip");
const alternativeTrips = document.querySelector(".alternative-trips");

function fetchPlaces(placeName) {
  return fetch(
    `${mapBoxBaseUrl}mapbox.places/${placeName}.json?bbox=${winnipegCoords}&access_token=${mapBoxApiKey}&limit=10`
  ).then((data) => data.json())
   .catch((error) => console.log('error:' + error));
}

function fetchTheTrip(origin, dest) {
  return fetch(
    `${transitBaseUrl}api-key=${transitApiKey}&origin=geo/${origin.lat},${origin.long}&destination=geo/${dest.lat},${dest.long}`
  ).then((data) => data.json())
  .catch((error) => console.log('error:' + error));
}

function printPlaceName(place, box) {
  box.insertAdjacentHTML(
    "beforeend",
    `<li data-long="${place.long}" data-lat="${place.lat}">
    <div class="name">${place.name}</div>
    <div>${place.address}</div>
  </li>`
  );
}

function manipulatePlacesData(places, box) {
  places.forEach((place) => {
    const placeData = {
      lat: place.center[1],
      long: place.center[0],
      name: place.text,
      address:
        place.properties.address !== undefined
          ? `${place.properties.address}`
          : "Winnipeg",
    };
    printPlaceName(placeData, box);
  });
}

function notifyUserForNoRelatedPlacesFound(box) {
  box.insertAdjacentHTML("beforeend", `<span> No results found </span>`);
}

function originFormFunctionality(event, box) {
  if (event.target.nodeName === "FORM") {
    const input = event.target.firstElementChild;
    const placeName = input.value;
    input.value = "";
    fetchPlaces(placeName).then((data) => {
      box.innerHTML = "";
      if (data.features.length === 0) {
        notifyUserForNoRelatedPlacesFound(box);
      } else {
        manipulatePlacesData(data.features, box);
      }
    });
  }
}

function manipulateTheList(event, box) {
  if (event.target.nodeName !== "FORM" && event.target.nodeName !== "INPUT") {
    let target;
    if (event.target.nodeName === "LI") {
      target = event.target;
    } else if (event.target.parentElement.nodeName === "LI") {
      target = event.target.parentElement;
    }
    selectAPlace(target, box);
  }
}

function selectAPlace(target, box) {
  let selectedli = box.querySelector(".selected");
  if (selectedli) {
    selectedli.classList.remove("selected");
  }
  if (target) {
    target.classList.add("selected");
  }
}

function checkForSelectedPlaces(origin, dest) {
  let message;
  if (origin === null && dest === null) {
    message = "please select an origin and a destination";
  } else if (origin === null) {
    message = "please select an origin";
  } else if (dest === null) {
    message = "please select a destination";
  } else if (
    origin.dataset.long === dest.dataset.long &&
    origin.dataset.lat === dest.dataset.lat
  ) {
    message = "please select a different destination from origin";
  } else {
    message = true;
  }
  return message;
}

function notifyUserForDataError(message) {
  busContainer.innerHTML = "";
  busContainer.insertAdjacentHTML(
    "beforeend",
    `<h2 class="message"> ${message} <h2>`
  );
}

function manipulateTripsData(trips) {
  let myTrips = {}, tripsArray=[];
  for (let trip in trips) {
    const currTrip = trips[trip];
    const duration = currTrip["times"]["durations"]["total"];
    const segments = currTrip["segments"];
    myTrips[duration] = {
      "duration" : duration,
      "segments" : segments,
    };
  }
  for(let trip in myTrips) {
    tripsArray.push(myTrips[trip]);
  }
  return tripsArray;
}

function printRecommendedTrip(trip) {
  console.log(trip)

  const newUl = document.createElement('ul');
  newUl.classList.add('my-trip');
  recommendedTrip.appendChild(newUl);

  trip.segments.forEach((segment) => {
    const type = segment.type ;
    if(type === 'walk') {
      printWalk(segment,newUl);
    } else if(type === "ride") {
      printRide(segment,newUl);
    } else if(type === "transfer") {
      printtransfer(segment,newUl);
    }
  })
}

function printAlternativeTrip(trip) {
  console.log(trip);
  const newUl = document.createElement('ul');
  newUl.classList.add('my-trip');
  alternativeTrips.appendChild(newUl);
  
  trip.segments.forEach((segment) => {
    const type = segment.type ;
    if(type === 'walk') {
      printWalk(segment,newUl);
    } else if(type === "ride") {
      printRide(segment,newUl);
    } else if(type === "transfer") {
      printtransfer(segment,newUl);
    }
  })
}

function printtransfer(segment,box){
box.insertAdjacentHTML('beforeend', 
`<li>
<i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop
#${segment["from"]["stop"]["key"]} - ${segment["from"]["stop"]["name"]} to stop #${segment["to"]["stop"]["key"]} - ${segment["to"]["stop"]["name"]}
</li>`)
}

function printRide(segment, box) {
  const durations = segment["times"]["durations"]["total"];
  box.insertAdjacentHTML('beforeend', 
  `<li>
  <i class="fas fa-bus" aria-hidden="true"></i>Ride the Route ${segment["route"]["key"]} ${segment["route"]["name"]}for ${durations} minutes.
</li>`)
}

function printWalk(segment, box) {
  console.log(segment.times);
  const duration = segment["times"]["durations"]["total"];
  const destination = segment["to"];
  if(destination["stop"] === undefined){
    box.insertAdjacentHTML('beforeend', 
    `<li>
    <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${duration}  minutes to
    your destination.
  </li>`)
  } else {
    box.insertAdjacentHTML('beforeend', 
  `<li>
  <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${duration} minutes
  to stop #${destination["stop"]["key"]} - ${destination["stop"]["name"]}
</li>`)
  }
}

function workWithTrips(allTrips) {
  if (allTrips.plans.length === 0) {
    notifyUserForNoRelatedPlacesFound("no routes found");
  } else {
    const myTrips = manipulateTripsData(allTrips.plans);
    recommendedTrip.innerHTML= "";
    alternativeTrips.innerHTML ="";
    recommendedTrip.insertAdjacentHTML('beforeend', 
    ` <h2>Recommeded-Trip</h2>`)
    alternativeTrips.insertAdjacentHTML('beforeend',
    `<h2>Alternative-Trips</h2>`)
    for(let trip = 0; trip < myTrips.length; trip++) {
      if(trip === 0) {
        printRecommendedTrip(myTrips[trip]);
      } else {
        printAlternativeTrip(myTrips[trip]);
      }
    }
  }
}

function planningTripFunctionality(origin, destination) {
  fetchTheTrip(origin, destination)
    .then((data) => {
      workWithTrips(data);
  });
}

function planTripFunction() {
  let originPlace = originUL.querySelector(".selected");
  let destinationPlace = destinationUL.querySelector(".selected");
  const message = checkForSelectedPlaces(originPlace, destinationPlace);
  if (message === true) {
    const origin = {
      lat: originPlace.dataset.lat,
      long: originPlace.dataset.long,
    };
    const destination = {
      lat: destinationPlace.dataset.lat,
      long: destinationPlace.dataset.long,
    };
    planningTripFunctionality(origin, destination);
  } else {
    notifyUserForDataError(message);
  }
}

originForm.addEventListener("submit", (event) => {
  event.preventDefault();
  originFormFunctionality(event, originUL);
});

destinationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  originFormFunctionality(event, destinationUL);
});

originContainer.addEventListener("click", (event) => {
  manipulateTheList(event, originUL);
});

destinationUL.addEventListener("click", (event) => {
  manipulateTheList(event, destinationUL);
});

planButton.addEventListener("click", () => {
  planTripFunction();
});
