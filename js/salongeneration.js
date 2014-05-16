var map;
var service;
var infowindow;
var initialLocation;
var browserSupportFlag =  new Boolean();
var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

function getPlaceDetails(){
	var refNumber = getURLParams('ref');
	var request = { "reference": String(refNumber) };
	initialLocation = new google.maps.LatLng(42.053317, -87.672788);

  	var myOptions = {
    	zoom: 6,
    	mapTypeId: google.maps.MapTypeId.ROADMAP,
    	center: initialLocation
  	}
  	map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
	service = new google.maps.places.PlacesService(map);

	service.getDetails(request, generateSalonPage);

}

function callback(results, status){
	return 1;
}

function generateSalonPage(salon, status){
	if(status == google.maps.places.PlacesServiceStatus.OK)
	{
		console.log(salon);
		insertPageHeader(salon.name);
		insertQuickInfo(salon.name, salon.types, salon.user_ratings_total, salon.price_level, salon.website)
		insertLocationInfo(salon.formatted_address, salon.formatted_phone_number);
		insertHoursInfo(salon.opening_hours.periods);
		getStylists(salon.name, salon.formatted_address, salon.opening_hours.periods);
		insertReviews(salon.reviews);
	}
	else
	{
		alert("ERROR: There was an error getting the details of your salon. Please go back and try again.");
	}
}

function insertPageHeader(name){
	var x = $('.header');
	x.append("<h1 id='title'>"+name+"<span><a href='results.html' id='back'><i class='fa fa-chevron-left fa-lg'></i></a></span></h1>");
}

function insertQuickInfo(name, type, rating, price, url){
	var x = $('.quick-info');
	var namestr = "<h2 class=\"name\">"+name+"</h2>";
	
	// get the type
	var typestr ="<h5 class=\"type\">";
	for(i = 0; i < type.length; i++)
	{
		typestr += type[i].replace("_", " ");
		if(i != (type.length - 1))
		{
			typestr += ", ";
		}
	}
	typestr += "</h5>";

	// get the rating
	var starstr = createRatingString(rating);
	var ratingstr = "<p class=\"stars\">" + starstr + "</p>";

	// get the amount
	var dollarstr = createPriceString(price);
	var pricestr = "";
	if (dollarstr == "Could not get price level") {
		pricestr = "";
	}
	else {
		pricestr = "<p class=\"price\">Price Range: " + dollarstr + "</p>";
	}
	
	// get the link
	var link = "<p class='link'>Website: " + url + "</p>";

	// print everything
	var resultstr = namestr + typestr + ratingstr + pricestr + link;
	x.prepend(resultstr);
}

function insertLocationInfo(address, phone){
	var x = $('.location');
	var headerstr = "<h3 class='divider'>Location</h3>";
	var addressStr = "<h5>" + address+ "</h5>";
	var phonestr = "<h5>"+phone+"</h5>";
	resultstr = headerstr +addressStr + phonestr;
	x.prepend(resultstr);
}

function insertHoursInfo(hoursArray){
	var x = $('.details');
	var headerstr = "<h3 class=\"divider\">Details</h3>";
	var hourstr = "";
	var sortedArray = hoursArray.sort(sortOpeningTimes);
	for(i = 0, next = 0; i < days.length; i++)
	{
		if(i == sortedArray[next].open.day)
		{
			var open = formatTime(sortedArray[next].open.hours, sortedArray[next].open.minutes);
			var close = formatTime(sortedArray[next].close.hours, sortedArray[next].close.minutes);
			hourstr += "<h5>"+days[i]+": " + open + " - " + close + "</h5>";
			next++;
		}
		else
		{
			hourstr += "<h5>"+days[i]+": Closed</h5>";
		}
	}

	var resultstr = headerstr + hourstr;
	x.prepend(resultstr);
}

function sortOpeningTimes(a, b){
	return a.open.day - b.open.day;
}

function insertReviews(data) {
	for (var i=0; i < data.length; i++) {
		var text = data[i].text;
		var rating = createRatingString(data[i].rating);
		var author = data[i].author_name;
		var num = Math.floor((Math.random()*4)+1);
		var pic = '<img src="images/'+num+'.png" class="img-circle media-object" />';
		var a = '<div class="media"><a class="pull-left" href="#">'+pic+'</a><div class="media-body"><h4 class="media-heading">'+rating+'</h4><p>'+text+'</p></div></div>';
		$('.reviews').append(a);
	}
}

//for querying database to get stylists names
function getStylists(salon_name, salon_address, hours){
	var stylists = ['Harvey Spector', 'Olivia Pope', 'Arya Stark', 'Jon Snow', 'Daniel Clark', 'Emily Thorne'];
	var date = new Date();
	var datestr = makeTommorrowsDateStr(date);
	getStylistsAppointments(salon_name, salon_address, hours, stylists, datestr);
}

function makeTommorrowsDateStr(date){
	var d = date;
	d.setDate(d.getDate()+1);

	var dstring = String(date.getMonth() + 1)+"/"+String(date.getDate())+"/"+String(date.getYear() + 1900);
	return dstring;
}

//will query database returning appointment objects for all the stylists in the group for a specific date
//will have to use containedIn to filter through database objects
function getStylistsAppointments(salon_name, salon_address, hours, stylists, date){
	var x = $('.list-stylists');
	var appointments = [];
	var resultstr = "";
	var headerstr = "<h3 class=\"divider\">Stylist Appointments for "+ date+"</h3>";
	for(var i = 0; i < stylists.length; i++)
	{
		 insertStylistInfo(salon_name, salon_address, hours, stylists[i], appointments, date);
	}
	x.prepend(headerstr);
	return;
}

function insertStylistInfo(salon_name, salon_address, hours, stylist, appointments, date){
	var x = $('.list-stylists');
	var today = new Date();
	var sortedHours = hours.sort(sortOpeningTimes);
	var headerstr = "<div class=\"panel panel-default\"><div class=\"panel-heading\">";
	var appointHeaderStr = "<div class=\"panel-body\"><div class=\"list-btns\">";
	var availableAppoints;
	var buttonStr = "<button type=\"button\" class=\"btn btn-primary .btn-sm\">";
	headerstr += "<h3 class=\"panel-title\">"+stylist+"</h3></div>";

	today = today.getDay();

	var todaysHours = getTodaysHours(today, sortedHours);
	if(todaysHours < 0)
	{
		availableAppoints = buttonStr + "Sorry, this person is not taking appointments today.</button>"
	}
	else
	{
		availableAppoints = generateTimeButtons(salon_name, salon_address, hours, appointments, date);
	}

	var resultstr =  headerstr + appointHeaderStr + availableAppoints + "</div></div></div>";
	x.prepend(resultstr);
}

//returns the hours object if the salon is open
//returns -1 if it is colosed
function getTodaysHours(today, hours){
	var day = -1;
	for(i = 0; i < hours.length; i++)
	{
		if(today == hours[i].open.day)
		{
			day = i;
			return day;
		}
	}
	return day;
}

function createRatingString(rating){
	var full = "<i class=\"fa fa-star\"></i>";
	var half = "<i class=\"fa fa-star-half-o\"></i>";

	if(rating <= 0.5)
	{
		return half;
	}
	if(rating > 0.5 && rating <= 1.25)
	{
		return full;
	}
	if(rating > 1.25 && rating <= 1.75)
	{
		return full+half;
	}
	if(rating > 1.75 && rating <= 2.25)
	{
		return full+full;
	}
	if(rating > 2.25 && rating <= 2.75)
	{
		return full+full+half;
	}
	if(rating > 2.75 && rating <= 3.25)
	{
		return full+full+full;
	}
	if(rating > 3.25 && rating <= 3.75)
	{
		return full+full+full+half;
	}
	if(rating > 3.75 && rating <= 4.25)
	{
		return full+full+full+full;
	}
	if(rating > 4.25 && rating <= 4.75)
	{
		return full+full+full+full+half;
	}
	if(rating > 4.75 && rating <= 5)
	{
		return full+full+full+full+full;
	}
	else
	{
		return "";
		console.log('Cannot get rating string');
	}
}

function formatTime(hour, minutes){
	var h = hour;
	var m = minutes;
	var ampm = 'AM';
	if(Number(hour) > 12)
	{
		h = hour - 12;
	}
	if(Number(hour) > 11)
	{
		ampm = 'PM';
	}
	if(Number(minutes) == 0)
	{
		m = "00";
	}
	if(Number(minutes) > 0 && Number(minutes) < 10)
	{
		m = "0"+String(minutes);
	}

	var retstr = String(h) + ":" + String(m) + " " + ampm;
	return retstr;
}

function createPriceString(price){
	var dollarstr = "<i class=\"fa fa-usd\"></i>";
	var retstr = "";
	if(isNaN(price))
	{
		retstr = "Can not get price level";
	}
	else
	{
		for(i = 0; i < price; i++)
		{
			retstr += dollarstr;
		}
	}

	return retstr;
}

function generateTimeButtons(salon_name, salon_address, hours, appointments, date){
	var availableTimes = getAvailableTimes(hours, appointments);
	var resultstr = "";
	for(var i = 0; i < availableTimes.length; i++)
	{
		resultstr += makeButtonString(salon_name, salon_address, availableTimes[i], date) + " ";
	}

	return resultstr;
}

//function to resolve appointments
//expected output is an array of time strings
function getAvailableTimes(hours, appointments){
	// var startH = Number(hours.open.hours);
	// var startM = Number(hours.open.minutes);
	// var closeH = Number(hours.close.hours);
	// var closeM = Number(hours.close.minutes);

	return ['9:00 AM', '10:00 AM', '1:00 PM', '3:00 PM'];	
	
}

function makeButtonString(salon_name, salon_address, time, date){
	var link = "reservation.html?time="+time+"&date="+date+"&salon="+salon_name+"&salonaddress="+salon_address;
	// console.log(link);
	// console.log(salon_name);
	// console.log(salon_address);
	var buttonStr = "<button type=\"button\" class=\"btn btn-primary .btn-sm\">"+
					"<a class=\"button\" href=\"reservation.html?time="+time+"&date="+date+"&salon="+salon_name+"&address="+salon_address+"\">"+time+"</a></button>";
	return buttonStr;
}

function addHour(time){
	var timeRes = time.split(":");
	var hour = Number(timeRes[0]);
	var minute = timeRes[1];
	var ampm = timeRes[1].split(" ");


	if(hour == 12)
	{
		hour = 1;
		if(ampm == "am" || ampm == "AM")
		{
			ampm = "PM";
		}
		else
		{
			ampm = "AM";
		}
	}
	else
	{
		hour += 1;
	}

	hour = String(hour);
	hour.concat(":"+minute+" "+ampm);
	return hour;

}

function getURLParams(sParam){
	var pageURL = window.location.search.substr(1);
	var URLvars = pageURL.split('&');
	for(var i=0; i < URLvars.length; i++)
	{
		var name = URLvars[i].split('=');
		if(name[0] == sParam)
		{
			var ret = name[1].replace(/%20/g, " ");
			ret = ret.replace(/%2D/g, "-");
			ret = ret.replace(/%3A/g, ":");
			ret = ret.replace(/%2C/g, ",");
			return ret;
		}
	}
}

$(document).ready(function(){ getPlaceDetails();});

// google.maps.event.addDomListener(window, 'onpaint', getPlaceDetails);