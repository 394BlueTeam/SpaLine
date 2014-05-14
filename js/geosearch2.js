var map;
var infowindow;

function initialize() {
  var mapOptions = {
    zoom: 6
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'Location found using HTML5.'
      });
      console.log(pos);
      map.setCenter(pos);
      places(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}



function places(coords) {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: coords,
    zoom: 15
  });

  var request = {
    location: coords,
    types: ['hair_care'],
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

google.maps.event.addDomListener(window, 'load', initialize);