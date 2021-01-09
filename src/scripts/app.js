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
  )
    .then((data) => {
      if(data.status === 200) {
        return data.json();
      }
    })
    .catch((error) => notifyUserForDataError(`error: No Data found`));
}

function fetchTheTrip(origin, dest) {
  return fetch(
    `${transitBaseUrl}api-key=${transitApiKey}&origin=geo/${origin.lat},${origin.long}&destination=geo/${dest.lat},${dest.long}`
  )
  .then((data) => {
    if(data.status === 200) {
      return data.json();
    }
  })
  .catch((error) => {
      notifyUserForDataError(`error: No Data found`)
    });
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

function notifyUserForNoRelatedDataFound(box) {
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
        notifyUserForNoRelatedDataFound(box);
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
  recommendedTrip.innerHTML = "";
  recommendedTrip.insertAdjacentHTML(
    "beforeend",
    `<h2 class="message"> ${message} <h2>`
  );
}

function manipulateTripsData(trips) {
  let myTrips = {},
    tripsArray = [];
  for (let trip in trips) {
    const currTrip = trips[trip];
    const duration = currTrip["times"]["durations"]["total"];
    const segments = currTrip["segments"];
    myTrips[duration] = {
      duration: duration,
      segments: segments,
    };
  }
  for (let trip in myTrips) {
    tripsArray.push(myTrips[trip]);
  }
  return tripsArray;
}

function printTrip(trip, tripBox) {
  const newUl = document.createElement("ul");
  newUl.classList.add("my-trip");
  tripBox.appendChild(newUl);

  trip.segments.forEach((segment) => {
    const type = segment.type;
    if (type === "walk") {
      manipulateAndPrintWalk(segment, newUl);
    } else if (type === "ride") {
      manipulateAndPrintRide(segment, newUl);
    } else if (type === "transfer") {
      manipulateAndPrinttransfer(segment, newUl);
    }
  });
}

function manipulateAndPrinttransfer(segment, box) {
  box.insertAdjacentHTML(
    "beforeend",
    `<li>
<i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop
#${segment["from"]["stop"]["key"]} - ${segment["from"]["stop"]["name"]} to stop #${segment["to"]["stop"]["key"]} - ${segment["to"]["stop"]["name"]}
</li>`
  );
}

function manipulateAndPrintRide(segment, box) {
  const durations = segment["times"]["durations"]["total"];
  box.insertAdjacentHTML(
    "beforeend",
    `<li>
  <i class="fas fa-bus" aria-hidden="true"></i>Ride the Route ${segment["route"]["key"]} ${segment["route"]["name"]}for ${durations} minutes.
</li>`
  );
}

function manipulateAndPrintWalk(segment, box) {
  const origin = segment["from"];
  const destination = segment["to"];
  const duration = segment["times"]["durations"]["total"];
  let message;
  if (origin !== undefined && origin["origin"] !== undefined) {
    message = `Walk for ${duration} minutes to stop #${destination["stop"]["key"]} - ${destination["stop"]["name"]}`;
  } else if (destination !== undefined && destination["destination"] !== undefined ) {
    message = `Walk for ${duration}  minutes to your destination.`;
  } else if (destination === undefined || origin === undefined) {
    message = `walk for ${duration} minutes`;
  }

  box.insertAdjacentHTML(
    "beforeend",
    `<li><i class="fas fa-walking" aria-hidden="true"></i>${message}</li>`
  );
}

function workWithTrips(myTrips) {
  recommendedTrip.insertAdjacentHTML("beforeend", ` <h2>Recommeded-Trip</h2>`);
  if (myTrips.length > 1) {
    alternativeTrips.insertAdjacentHTML(
      "beforeend",
      `<h2>Alternative-Trips</h2>`
    );
    for (let trip = 0; trip < myTrips.length; trip++) {
      if (trip === 0) {
        printTrip(myTrips[trip], recommendedTrip);
      } else {
        printTrip(myTrips[trip], alternativeTrips);
      }
    }
  }
}

function checkIfTripsFound(trips) {
  if (trips.length === 0) {
    notifyUserForDataError("no routes found");
  } else {
    const myTrips = manipulateTripsData(trips);
    workWithTrips(myTrips);
  }
}

function planningTripFunctionality(origin, destination) {
  fetchTheTrip(origin, destination)
  .then((tripsResponse) => {
    if(tripsResponse !== undefined) {
      checkIfTripsFound(tripsResponse.plans);
    } else (notifyUserForDataError("No data found"))
  })
  .catch(error => notifyUserForDataError('error:' + error));
}

function planTrip() {
  let originPlace = originUL.querySelector(".selected");
  let destinationPlace = destinationUL.querySelector(".selected");
  recommendedTrip.innerHTML = "";
  alternativeTrips.innerHTML = "";
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
  planTrip();
});
