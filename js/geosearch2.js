var map;
var initialLocation;
var infowindow;
var evanston = new google.maps.LatLng(42.053317, -87.672788);

function initialize() {
  var mapOptions = {
    zoom: 6
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  /*=== Get the user's location ===*/
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      console.log(initialLocation);
      map.setCenter(initialLocation);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }

  /*=== Create a places request ===*/
  var request = {
    location: initialLocation,
    types: ['hair_care'],
    rankBy: google.maps.places.RankBy.DISTANCE
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed. Default to Evanston, IL.';
    initialLocation = evanston;
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  map.setCenter(initialLocation);
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

google.maps.event.addDomListener(window, 'load', initialize);
