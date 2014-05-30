var map;
var service;
var infowindow;
var browserSupportFlag =  new Boolean();
var requestLocation;
var RUSH = false;
var requestName;
function getUserLocation(){
  if(navigator.geolocation)
  {
    if (top.window.location.search == "") {
      RUSH = true;
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
    requestName = '';
    var keywords = top.window.location.search.split("=")[1].split("+");
    for (var i = 0; i < keywords.length; i++) {
      requestName = requestName + keywords[i] + ' ';
    }
    // console.log(requestName);

    requestLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var myOptions = {
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: requestLocation
              }

      var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    map.setCenter(requestLocation);
    // console.log("Requesting Location is: "+ requestLocation);
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
  if (status == google.maps.places.PlacesServiceStatus.OK) 
  {
    for (var i = 0; i < results.length; i++) 
    {
      var request = {
                      reference: results[i].reference
                    }
        service.getDetails(request, getResultDistance);
    }
  }
  else if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS)
  {
    notifyNoResults();
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
    // console.log(place);
    pic = insertPic(place.photos);
    if (pic != '') {
      var html = "<li class='col-sm-4 col-md-3 thumbnail'>";
      html += pic; 
    }

    else {
      var html = "<li class='col-sm-4 col-md-3 thumbnail'>";
    }

    var buttons = "<div class='appts'>";
    if(RUSH)
    {
      if(!!place.opening_hours)
      {
        // console.log("opening hours exists");
        var appointHeaderStr = "<div class=\"panel-body\"><div class=\"list-btns\">";
        var buttonHeader = "<button type=\"button\" class=\"btn btn-primary .btn-sm\">";
        var appointmentStr = createAppointmentButtons(place);
        console.log("Appointment string is: ", appointmentStr);
        if(appointmentStr == "")
        {
          buttons += "<p class='btn_alert'>Sorry, it looks like this salon has no more available appointments today</p>";
          buttons += "<p class='btn_alert'>Click on the salon name to choose an appointment for a future date</p></div>";
        }
        else
        {
          buttons = appointHeaderStr +appointmentStr + "</div>";
        }
      }
      else
      {
        buttons += "<p class='btn_alert'>Sorry, it looks like this salon's hours are not available</p>";
        buttons += "<p class='btn_alert'>Try giving them a call at "+place.formatted_phone_number+" to make an appointment</p></div>";
      }
    }
    // console.log("Buttons is: ",buttons);

    html += "<div class='caption'><h3 class='name'><a href='salon.html?ref="+place.reference+"'>"+place.name+"</a></h3>";
    var end = ", IL, United States";
    var address = place.formatted_address;  
    var short_address = address.substring(0,(address.length - end.length));
    html += "<p class='address'>"+short_address+"</p>"
    html += "<p class='distance'>"+distance+"</p></div>"
    html += buttons
    html += "</div></li>"

  //     <p class="rating"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i></p>
  // <p class="cost"><i class="fa fa-usd"></i><i class="fa fa-usd"></i></p>
    
    $('#salonList').append(html);
}

function createAppointmentButtons(place){
  var name = place.name;
  var reference = place.reference;
  var id = place.id;
  var address = place.formatted_address;
  var datestr = makeTodayDateStr();

  storeSalonID(id, reference, name, address);

  var now = getCurrentTimePieces();
  var hours = place.opening_hours.periods;
  var sortedHours = hours.sort(sortOpeningTimes);
  // console.log(place.opening_hours.periods);
  var todayIndex = getTodaysIndex(now[2], sortedHours);
  var availableTimes = createSalonAppointments(place.opening_hours.periods, now, todayIndex);

  var resultstr = "";
  // console.log("availableTimes is: ", availableTimes);
  for(var i = 0; i < availableTimes.length; i++)
  {
    resultstr += " "+createAppointmentString(name, address, availableTimes[i], datestr, id);
  }  

  return resultstr;
}

function createSalonAppointments(hours, now, today){
  // console.log(now[2], hours);
  var startH = Number(hours[today].open.hours);
  var startM = Number(hours[today].open.minutes);
  var closeH = Number(hours[today].close.hours);
  var closeM = Number(hours[today].close.minutes);
  var nowH = now[0];
  var nowM = now[1];

  var available = new Array();

  for(var i = startH; i < closeH; i++)
  {
    if(i > nowH || (startM > nowM && i == nowH)) 
    {
      available.push([i, startM]);
    }
  }

  var formattedTimes = new Array();

  for(var i = 0; i < available.length; i++)
  {
    var time = formatTime(available[i][0], available[i][1]);
    formattedTimes.push(time);
  }

  return formattedTimes;
}

function createAppointmentString(salon_name, salon_address, time, date, salonID){
  var link = "reservation.html?time="+time+"&date="+date+"&salon="+salon_name+
              "&address="+salon_address+"&id="+salonID+"&stylistid=0";

  var buttonStr = "<button type=\"button\" class=\"btn btn-primary .btn-sm\">"+
          "<a class=\"button\" href=\""+link+"\">"+time+"</a></button>";

  return buttonStr;
}

function insertPic(data) {
    if (!data) {
      var num = Math.floor((Math.random()*6)+1);
      var pic = '<div class="icon"><img src="images/'+num+'.jpg" class="salon-icon img-rounded" /></div>';
      return pic;
    }

    else {
      var url = data[0].getUrl({'maxWidth': 150, 'maxHeight': 150});
      // console.log(url);
      var pic = "<div class='icon'><img src='"+url+"' class='salon-icon img-rounded'></div>";
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

function notifyNoResults(){
  console.log("ERROR: No location results returned");
  var x = $('.wrapper');
  var html = "<h3>Sorry, no results matched your query: "+requestName;
  html += "<p>Please click <a href=\'index.html\'>here</a> to return to the home page and try again</p>";
  x.append(html);
}

google.maps.event.addDomListener(window, 'load', getUserLocation);
