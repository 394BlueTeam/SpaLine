var map;
var service;
var infowindow;
var browserSupportFlag =  new Boolean();
var requestLocation;

function getUserLocation(){
  if(navigator.geolocation)
  {
    if (top.window.location.search == "") {
      navigator.geolocation.getCurrentPosition(requestSalonInformation, handleLocationErrors);
    } else {
      navigator.geolocation.getCurrentPosition(requestSpecificSalonInformation, handleLocationErrors);
    }
  }
  else
  {
    console.log("Handle no geolocation 1");
      browserSupportFlag = false;
      handleNoGeolocation(browserSupportFlag);
  }
}

function requestSalonInformation(position){
  if(position)
  {
  requestLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
              zoom: 6,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              center: requestLocation
            }

    var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  map.setCenter(requestLocation);
  console.log("Requesting Location is: "+ requestLocation);
  var request = {
                  location : requestLocation,
                  types: ['hair_care'],
                  rankBy: google.maps.places.RankBy.DISTANCE
                };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, getResultDetails);
  }
  else
  {
    console.log("Handle no geolocation");
    handleNoGeolocation(true);
  }
}

function requestSpecificSalonInformation(position){
  if(position)
  {
  var requestName = '';
  var keywords = top.window.location.search.split("=")[1].split("+");
  for (var i = 0; i < keywords.length; i++) {
    requestName = requestName + keywords[i] + ' ';
  }
  console.log(requestName);

  requestLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
              zoom: 6,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              center: requestLocation
            }

    var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  map.setCenter(requestLocation);
  console.log("Requesting Location is: "+ requestLocation);
  var request = {
                  location : requestLocation,
                  name: [requestName],
                  types: ['hair_care'],
                  rankBy: google.maps.places.RankBy.DISTANCE
                };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, getResultDetails);
  }
  else
  {
    console.log("Handle no geolocation");
    handleNoGeolocation(true);
  }
}

function getResultDetails(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    //for (var i = 0; i < results.length; i++) {
        //var request = {
            //reference: results[i].reference
        //}
        //service.getDetails(request, getResultDistance);
    //}
    var i = 0;
    console.log(results);
    function delayLoop() {
        setTimeout(function() {
            var request = {
                reference: results[i].reference
            }
            service.getDetails(request, getResultDistance);
            i++;
            if (i < results.length) delayLoop();
        }, 300)
    }
    
    delayLoop();
  }
}
var distanceService = new google.maps.DistanceMatrixService();

function getResultDistance(place, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
        distanceService.getDistanceMatrix(
      {
        origins: [requestLocation],
        destinations: [place.geometry.location],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      }, function(response, status){addSalon(place, response.rows[0].elements[0].distance.text)});
  }
}

function addSalon(place, distance){
    console.log(place);
    pic = insertPic(place.photos);
    if (pic != '') {
      var html = "<li class='col-sm-4 col-md-3 thumbnail'>";
      html += pic; 
    }

    else {
      var html = "<li class='col-sm-4 col-md-3 thumbnail'>";
    }

    
    html += "<div class='caption'><h3 class='name'><a href='salon.html?ref="+place.reference+"'>"+place.name+"</a></h3>";
    html += "<p class='address'>"+place.formatted_address+"</p>"
    html += "<p class='distance'>"+distance+"</p>"
    html += "</div></div></li>"
  //     <p class="rating"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i></p>
  // <p class="cost"><i class="fa fa-usd"></i><i class="fa fa-usd"></i></p>
    
    $('#salonList').append(html);
}


function insertPic(data) {
    if (!data) {
      var pic = "";
      return pic;
    }

    else {
      var url = data[0].getUrl({'maxWidth': 150, 'maxHeight': 150});
      // console.log(url);
      var pic = "<img src='"+url+"'>";
      // console.log(pic);
      return pic;
      // console.log(pic);
    } 
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    console.log("Geolocation services failed");
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
    console.log("Your browser does not support geolocation services");
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

function handleLocationErrors(error){
  console.log("Error in retriving location");
  switch(error.code)
  {
    case error.PERMISSION_DENIED:
      handlePermissionDenied();
      break;
    case error.POSITION_UNAVAILABLE:
      handlePositionUnavailable();
      break;
    case error.TIMEOUT:
      handleTimeout();
      break;
    case error.UNKOWN_ERROR:
      handleUnknown();
      break;
  }
}

function handlePermissionDenied(){
  console.log("ERROR: User denied permission to location services");
  var x = $('.wrapper');
  x.append("<h3>Sorry, you need to allow location services to see this page</h3>");
}

function handlePositionUnavailable(){
  console.log("ERROR: User's Position is unavailable");
  var x = $('.wrapper');
  x.append("<h3>Sorry, it looks like your position is temporarily unavailable</h3>");
  x.append("<p>Check your network connection and make sure you have location services enabled, then try again</p>");
}

function handleTimeout(){
  console.log("ERROR: Timeout occurred when getting location");
  var x = $('.wrapper');
  x.append("<h3>Sorry, it looks like a timeout occurred when trying to get your location</h3>");
  x.append("<p>Check your network connection and try again</p>");
}

function handleUnknown(){
  console.log("ERROR: An unknown error occurred");
  var x = $('.wrapper');
  x.append("<h3>Sorry, it looks like an unknown error occurred</h3>");
  x.append("<p>Please try your request again</p>");
}

google.maps.event.addDomListener(window, 'load', getUserLocation);
