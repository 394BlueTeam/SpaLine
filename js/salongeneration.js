Parse.initialize("o6UHd0P7UT2nyRw8Djmz8YwxG6copYOr2DjhGpoA", "1WDfNgPeu4d8Qc9bHyeNMVOPkvBVQ7mmYLnu53pD");
var map;
var service;
var infowindow;
var initialLocation;
var browserSupportFlag =  new Boolean();
var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var refNumber;
var salonID;
var NEW_STYLIST_NUMBER = 10;

var firstnames = ['Arya', 'Ned', 'Zach', 'Jon', 'John', 'Harvey', 'Tim', 'Amanda', 'Emily', 'Stacy', 'David', 'Chao',
				  'Yu', 'Shuanping', 'Rohit', 'Sean', 'Daniel', 'Olivia', 'Lindsey', 'Chris', 'Jesus', 'Ted'];
var lastnames = ['Austin', 'Anumba', 'Ryan', 'Feng', 'Liu', 'Zhou', 'Riesbeck', 'Gupta', 'Saager', 'Smith', 'Doe', 
				 'Stark', 'Spector', 'Wilde', 'Clarke', 'Pope', 'Snow', 'Thorne', 'Santana', 'Leon', 'Wu'];

//get place details from google places api call
function getPlaceDetails(){
	refNumber = getURLParams('ref');
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

//main function for generating the salon page
//calls all the functions that fill in the various parts
function generateSalonPage(salon, status){
	if(status == google.maps.places.PlacesServiceStatus.OK)
	{
		salonID = salon.id;
		storeSalonID(salonID, refNumber, salon.name, salon.formatted_address);
		console.log(salon);
		insertPageHeader(salon.name);
		insertQuickInfo(salon.name, salon.types, salon.user_ratings_total, salon.price_level, salon.website)
		insertLocationInfo(salon.formatted_address, salon.formatted_phone_number);
		if(salon.opening_hours)
		{
			insertHoursInfo(salon.opening_hours.periods);
			getStylists(salon.name, salon.formatted_address, salon.opening_hours.periods, salonID);
		}
		else
		{
			console.log("else");
			promptToCall();
		}
		if(salon.reviews)
		{
			insertReviews(salon.reviews);
		}
		else
		{
			noReviewsAvailable();
		}
	}
	else
	{
		alert("ERROR: There was an error getting the details of your salon. Please go back and try again.");
	}
}

//calls the Parse cloud function to store salon id, ref, name, address
function storeSalonID(id, ref, name, address){
	var jsonObj = {
					salonid: String(id),
					name: String(name),
					address: String(address),
					reference: String(ref)
				  };

	Parse.Cloud.run('storeSalonID', jsonObj, {
		success: function(store){
			console.log("Reference number stored");
			return;
		},
		error: function(error){
			console.log("Failed to store reference number");
			return;
		}
	});
}

//appends the page header
function insertPageHeader(name){
	var x = $('.header');
	x.append("<h1 id='title'>"+name+"<span><a href='results.html' id='back'><i class='fa fa-chevron-left fa-lg'></i></a></span></h1>");
}

//inserts the quick info section of the salon page
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

//inserts the location info section of the salon page
function insertLocationInfo(address, phone){
	var x = $('.location');
	var headerstr = "<h3 class='divider'>Location</h3>";
	var addressStr = "<h5>" + address+ "</h5>";
	var phonestr = "<h5>"+phone+"</h5>";
	resultstr = headerstr +addressStr + phonestr;
	x.prepend(resultstr);
}

//inserts the store hours into the salon page
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

//function used to sort the opening hours object from Sunday to Saturday
function sortOpeningTimes(a, b){
	return a.open.day - b.open.day;
}

//inserts the various reviews
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
//uses salonid to pull all stylists with matching IDs
//if there are any stlists, it calls getStylistAppointments with the set returned from the database
//otherwise it uses the preset array
function getStylists(salon_name, salon_address, hours, sid){
	var preset = ['Harvey Spector', 'Olivia Pope', 'Arya Stark', 'Jon Snow', 'Daniel Clark', 'Emily Thorne'];
	var date = new Date();
	var datestr = makeTommorrowsDateStr(date);

	var jsonObj = {
					salonid: String(sid)
				  };

	Parse.Cloud.run('getStylists',jsonObj, {
		success: function(stylists){
			if(stylists.length < 1)
			{
				console.log("Creating new stylists");
				//create 
				for(var i = 0; i < NEW_STYLIST_NUMBER; i++)
				{
					createStylist(sid);
				}
				getStylists(salon_name, salon_address, hours, sid);
			}
			else
			{
				console.log("Using stylists from database");
				getStylistsAppointments(salon_name, salon_address, hours, stylists, datestr);
			}
		},
		error: function(error){
			console.log("There was an error getting stylists from the database");
		}
	});
}

//makes tomorrow's date string from a given date object
//currently used for the URL param I believe
function makeTommorrowsDateStr(date){
	var d = date;
	d.setDate(d.getDate()+1);

	var dstring = String(date.getMonth() + 1)+"/"+String(date.getDate())+"/"+String(date.getYear() + 1900);
	return dstring;
}

//Queries the database to get all the appointments for the given day and set of stylists
//the db argument is used to see if we are using the preset stylists or not
//if we are, we don't bother doing the query because it won't return anything
function getStylistsAppointments(salon_name, salon_address, hours, stylists, date){
	var x = $('.list-stylists');
	var appointments = [];
	var resultstr = "";
	var today = new Date();
	today.setDate(today.getDate()+1);
	var day = today.getDay();
	var headerstr = "<h3 class=\"divider\">Stylist Appointments for "+ dayNames[day] +", "+ date+"</h3>";
	var dateEles = date.split("/");
	var todayStart = new Date(dateEles[2], dateEles[0]-1, dateEles[1]);
	var todayEnd = new Date(dateEles[2], dateEles[0]-1, dateEles[1]);
	todayEnd.setDate(todayEnd.getDate()+1);
	
	var appointmentQuery = new Parse.Query('Appointments');
	var stylist_ids = createStylistIDArray(stylists);
	appointmentQuery.containedIn("StylistID", stylist_ids);
	appointmentQuery.greaterThan("Time", todayStart);
	appointmentQuery.lessThan("Time", todayEnd);
	appointmentQuery.find({
		success: function(appointments){
			for(var i = 0; i < stylists.length; i++)
			{
				insertStylistInfo(salon_name, salon_address, hours, stylists[i].get('Name'), appointments, date, stylists[i].id);
			}
		},
		error: function(error){
			console.log("Could not get appointments");
		}
	});

	x.prepend(headerstr);
	return;
}

//Creates an array of the stylist ids
//used for the containedIn constraint for the appointment query
function createStylistIDArray(stylists){
	var idArray = new Array();
	for(var i = 0; i < stylists.length; i++)
	{
		idArray.push(String(stylists[i].id));
	}
	return idArray;
}

//Checks to see if the store is open for the given day
//if it is, call generateTimeButtons
//otherwise show indicate that the stylists aren't taking appointments today
//append results
function insertStylistInfo(salon_name, salon_address, hours, stylist, appointments, date, stylist_id){
	var x = $('.list-stylists');
	var today = new Date(date);
	var sortedHours = hours.sort(sortOpeningTimes);
	var headerstr = "<div class=\"panel panel-default\"><div class=\"panel-heading\">";
	var appointHeaderStr = "<div class=\"panel-body\"><div class=\"list-btns\">";
	var availableAppoints;
	var buttonStr = "<button type=\"button\" class=\"btn btn-primary .btn-sm\">";
	headerstr += "<h3 class=\"panel-title\">"+stylist+"</h3></div>";

	today = today.getDay();

	var todaysIndex = getTodaysIndex(today, sortedHours);
	if(todaysIndex < 0)
	{
		availableAppoints = buttonStr + "Sorry, this person is not taking appointments today.</button>"
	}
	else
	{
		availableAppoints = generateTimeButtons(salon_name, salon_address, hours, appointments, date, stylist_id, todaysIndex);
	}

	var resultstr =  headerstr + appointHeaderStr + availableAppoints + "</div></div></div>";
	x.append(resultstr);
}

//returns the hours object index if the salon is open
//returns -1 if it is colosed
function getTodaysIndex(today, hours){
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

//creates the rating string to append based on the average review rating
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

//Takes in hour, minutes in 24 hour pair
//and converts it to the appropriate time string
//ie formatTime(14, 30) -> "2:30 PM"
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

//create the price string to append based on the google places api
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

//calls getAvailableTimes to determine available times
//iterates over the available times calling makeButtonString for each one
//appends the results together to return
function generateTimeButtons(salon_name, salon_address, hours, appointments, date, stylist_id, today){
	var availableTimes = getAvailableTimes(hours, appointments, stylist_id, today);
	var resultstr = "";
	for(var i = 0; i < availableTimes.length; i++)
	{
		resultstr += makeButtonString(salon_name, salon_address, availableTimes[i], date, stylist_id) + " ";
	}

	return resultstr;
}

//function to resolve appointment conflicts
//input:
////the hours object from google places api
////the appointments array from the parse query
////the stylist id
////the day index
//
//output:
/////an array of formatted available times: ["9:00 AM", "10:00 AM"...]
//
//calls extractStylistAppointments to get only the appointments for the specific stylist id
//creates an array of the hour portions of the already scheduled appointments
//iterates from start to close, checks to see if the hour is in the unavailable array 
//and if it is not in the available array
//if both are true, then it pushes it to the available array
//it then iterates through the available array formatting the times and returns them in the output array
//
//Note: 
////This current method only has to worry about the hours because it is assumming: 
////1. an hour long appointment slot
////2. that each stylist is taking appointments from open to close
////Because of this, if the store opens at XX:YY, then the YY will remain constant no matter how many bookings
function getAvailableTimes(hours, appointments, stylist_id, todayIndex){
	var startH = Number(hours[todayIndex].open.hours);
	var startM = Number(hours[todayIndex].open.minutes);
	var closeH = Number(hours[todayIndex].close.hours);
	var closeM = Number(hours[todayIndex].close.minutes);

	var unavailable = extractStylistAppointments(appointments, stylist_id);

	var unavailableHours = new Array();
	for(var i = 0; i < unavailable.length; i++)
	{
		unavailableHours.push(unavailable[i][0]);
	}

	var available = new Array();

	//NOTE: I HAVE NO IDEA WHY TWO LOOPS OF THE SAME THING ARE NEEDED HERE
	//BUT FOR SOME REASON WHEN I COMMENT IT OUT IT ONLY SHOWS THE FIRST APPOINTMENT TIME
	//I AM SO CONFUSED!?!?!
	//I HOPE MY CAPS LOCK IS INDICATING MY CONFUSION
	for(var i = startH; i < closeH; i++)
	{

		for(var i = startH; i < closeH; i++)
		{
				if(unavailableHours.indexOf(i) < 0 && !availableContains(i, available))
				{
					available.push([i, startM]);
					break;
				}
		}

	}
	var formattedTimes = new Array();

	for(var i = 0; i < available.length; i++)
	{
		var time = formatTime(available[i][0], available[i][1]);
		formattedTimes.push(time);
	}

	// return ['9:00 AM', '10:00 AM', '1:00 PM', '3:00 PM'];
	return formattedTimes;
}

//checks to see if the available array contains the given element
//note: this assumes that the given array is an array of arrays
function availableContains(ele, array){
	for(var i = 0; i < array.length; i++)
	{
		if(array[i][0] == ele)
		{
			return true;
		}
	}
	return false;
}

//iterates through the appointments array 
//and collects the Time objects from appointments that have a matching stylist id
//calls get time pieces on the result
function extractStylistAppointments(appointments, stylist_id){
	var toReturn = new Array();
	for(var i = 0; i < appointments.length; i++)
	{
		if(appointments[i].get('StylistID') == String(stylist_id))
		{
			toReturn.push(appointments[i].get('Time'));
		}
	}
	return getTimePieces(toReturn);
}

//takes an array of date objects
//returns an array of two element arrays
//the first position of the two element array is the hours
//the second position is the minutes
function getTimePieces(appointments){
	var timePieces = new Array();
	for(var i = 0; i < appointments.length; i++)
	{
		var date = appointments[i];
		date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
		var h = date.getHours();
		var m = date.getMinutes();
		var dateArray = [h, m];
		timePieces.push(dateArray);
	}
	return timePieces;
}

//makes the button string to append for the given available appointment information
function makeButtonString(salon_name, salon_address, time, date, stylist_id){
	var link = "reservation.html?time="+time+"&date="+date+"&salon="+salon_name+"&address="+salon_address+"&id="+salonID+"&stylistid="+stylist_id;
	// console.log(link);
	// console.log(salon_name);
	// console.log(salon_address);
	var buttonStr = "<button type=\"button\" class=\"btn btn-primary .btn-sm\">"+
					"<a class=\"button\" href=\""+link+"\">"+time+"</a></button>";
	return buttonStr;
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

//For the cases where store hours are unavailable, lets the person know they should try giving them a call
function promptToCall(){
	var x = $('.list-stylists');
	x.append("<h3>Sorry, it doesn't look like we have store hours for this salon.</h3>");
	x.append("<p>Try giving them a call to see when you can book an appointment.</p>");
}

//for the case when no reviews are available
function noReviewsAvailable(){
	var x = $('.reviews');
	x.append("<h2>Sorry, there are no reviews available at this time</h2>");
	x.css('text-align', "center");
}

function createStylist(sid){
	var fname = chooseFirstName();
	var lname = chooseLastName();
	var fullname = fname +" "+ lname;
	var jsonObj = {
					name: fullname,
					salonid: sid
				  };

	Parse.Cloud.run('createStylist', jsonObj,{
		success: function(created){
			console.log("Successfully created stylist");
			return created;
		},
		error: function(error){
			console.log("Failed to create stylists with error code: ", error);
			return;
		}
	});	
}

function chooseFirstName(){
	var index = Math.round(Math.random()*(firstnames.length-1));
	return firstnames[index];
}

function chooseLastName(){
	var index = Math.round(Math.random()*(lastnames.length-1));
	return lastnames[index];
}

$(document).ready(function(){ getPlaceDetails();});
// google.maps.event.addDomListener(window, 'onpaint', getPlaceDetails);