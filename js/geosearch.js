var map;
var service;
var infowindow;
var initialLocation;
var browserSupportFlag =  new Boolean();


function initialize() {

  /*=== Initialize the map ===*/
  initialLocation = new google.maps.LatLng(42.053317, -87.672788);

  var myOptions = {
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: initialLocation
  }
  var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

  /*=== Get the user's location ===*/

  // // Try W3C Geolocation (Preferred)
  // if(navigator.geolocation) {
  //   browserSupportFlag = true;
  //   navigator.geolocation.getCurrentPosition(function(position) {
  //     initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
  //     map.setCenter(initialLocation);
  //   }, function() {
  //     handleNoGeolocation(browserSupportFlag);
  //   });
  // }
  // // Browser doesn't support Geolocation
  // else {
  //   browserSupportFlag = false;
  //   handleNoGeolocation(browserSupportFlag);
  // }


/*=== Create a places request ===*/
  
  var request = {
    location: initialLocation,
    types: ['hair_care'],
    // radius: '10000',
    // rankBy: google.maps.places.RankBy.PROMINENCE
    rankBy: google.maps.places.RankBy.DISTANCE
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
        var request = {
            reference: results[i].reference
        }
        service.getDetails(request, callbackTwo);
    }
  }
}
var distanceService = new google.maps.DistanceMatrixService();

function callbackTwo(place, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
        distanceService.getDistanceMatrix(
      {
        origins: [initialLocation],
        destinations: [place.geometry.location],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      }, function(response, status){addSalon(place, response.rows[0].elements[0].duration.text)});
  }
}

function addSalon(place, distance){
    console.log(place.types)
    var html = "<li class='col-sm-4 col-md-3 thumbnail'>"
    html += "<img src='"+place.icon+"'></img>"
    if (place.website != undefined){
        html += "<div class='caption'><h3 class='name'><a href='salon.html?ref="+place.reference+"'>"+place.name+"</a></h3>"
    }   
    else{
        html += "<div class='caption'><h3 class='name'>"+place.name+"</h3>"
    }
    html += "<p class='address'>"+place.formatted_address+"</p>"
    html += "<p class='distance'>"+distance+"</p>"
    html += "</div></div></li>"
  //     <p class="rating"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i></p>
  // <p class="cost"><i class="fa fa-usd"></i><i class="fa fa-usd"></i></p>
    
    $('#salonList').append(html);
}

/* === map generation (later) === */

// function createMarker(place) {
//   var placeLoc = place.geometry.location;
//   var marker = new google.maps.Marker({
//     map: map,
//     position: place.geometry.location
//   });

//   google.maps.event.addListener(marker, 'click', function() {
//     infowindow.setContent(place.name);
//     infowindow.open(map, this);
//   });
// }

  // function handleNoGeolocation(errorFlag) {
  //   if (errorFlag == true) {
  //     alert("Geolocation service failed.");
  //     initialLocation = new google.maps.LatLng(40.69847032728747, -73.9514422416687);
  //   } else {
  //     alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
  //     initialLocation = new google.maps.LatLng(60, 105);
  //   }
  //   map.setCenter(initialLocation);
  // }

google.maps.event.addDomListener(window, 'load', initialize);