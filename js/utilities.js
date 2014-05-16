Parse.initialize("o6UHd0P7UT2nyRw8Djmz8YwxG6copYOr2DjhGpoA", "1WDfNgPeu4d8Qc9bHyeNMVOPkvBVQ7mmYLnu53pD");

function sendConfirmationEmail(frm){

	// var frm = document.getElementById('reservation-form');
	var fName = $("input[name=firstname]").val();
	var lName = $("input[name=lastname]").val();
	var rName = fName + " " + lName;
	var rDate = getURLParams('date');
	var rTime = getURLParams('time');
	var rSalon = getURLParams('salon');
	var f_email = $("input[name=email]").val();
	var rEmail = String(f_email);
	var f_phone = $("input[name=phone]").val();
	var rPhone = String(f_phone);

	// var fName = frm.lastname.value;
	// var lName = frm.lastname.value;
	// var rName = fName + " " + lName;
	// var rDate = getURLParams('date');
	// var rTime = getURLParams('time');
	// var rSalon = getURLParams('salon');
	// var rEmail = String(frm.email.value);
	// var rPhone = String(frm.phone.value);

	//check to make sure parameters are from url
	if(!rTime || !rDate || !rSalon)
	{
		$('#alert3').show();
        setTimeout( "jQuery('#alert3').hide();", 7000 );
		// alert("No time, date, or salon selected");
		console.log("Time is: ", rTime);
		console.log("Date is: ", rDate);
		console.log("Salon is: ", rSalon);
		return;
	}

	//check to make sure form is completely filled out
	if(rPhone == "" || rEmail =="" || fName == "" || lName == "")
	{
		// alert("There was an error submitting your reservation.\nPlease make sure the form is filled out completely and try submitting again.");
		$('#alert3').show();
        setTimeout( "jQuery('#alert3').hide();", 7000 );
		return;
	}

	//create json object
	var jsonOb = { name: rName,
				   email: rEmail,
				   phone: rPhone,
				   date: String(rDate),
				   time: String(rTime),
				   salon: String(rSalon) 
				};

	//call the email confirmation function
	Parse.Cloud.run('sendConfirmationEmail', jsonOb, {
		success: function(confirm){
			console.log("email sent");
			$('.jumbotron').hide();
            $('#reservation-form').hide();
            $('#s-alert1').show();
            setTimeout( "jQuery('#s-alert1').hide(); window.location.replace('index.html');", 5000 );
			// alert("You have made your reservation! Check your email for confirmation.");
			return;
		},
		error: function(error){
			console.log("email didn't send");
			console.log(error.message);
			var eMessage = error.message;
			//check to see if it was an invalid email address
			if(eMessage.indexOf("valid email") > -1)
			{
				$('#alert1').show();
                setTimeout( "jQuery('#alert1').hide();", 7000 );
				// alert("Your email address is not valid. Check to make sure and try again");
				return;
			}
			else
			{	
				$('#alert2').show();
                setTimeout( "jQuery('#alert2').hide();", 7000 );
				// alert("There was an error reserving your time slot.");
				return;
			}
		}
	});
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
			ret = ret.replace(/%27/g, "'");
			return ret;
		}
	}
}

function bookAppointment(){

	var frm = document.getElementById('reservation-form');
	var fName = frm.firstname.value;
	var lName = frm.lastname.value;
	var rName = fName + " " + lName;
	var rDate = getURLParams('date');
	var rTime = getURLParams('time');
	var rSalon = getURLParams('salon');
	var rAddress = getURLParams('address');
	var stylist_id = getURLParams('stylistid');
	var sid = getURLParams('id');
	var rEmail = String(frm.email.value);
	var rPhone = String(frm.phone.value);
	//check to make sure parameters are from url
	if(!rTime || !rDate || !rSalon || !rAddress || !sid || !stylist_id)
	{
		alert("No time, date, or salon selected");
		console.log("Time is: ", rTime);
		console.log("Date is: ", rDate);
		console.log("Salon is: ", rSalon);
		console.log("Address is: ", rAddress);
		console.log("Ref is: ", sid);
		console.log("Stylist ID is: ", stylist_id);
		return;
	}
	//check to make sure form is completely filled out
	if(rPhone == "" || rEmail =="" || fName == "" || lName == "")
	{	
		alert("There was an error submitting your reservation.\nPlease make sure the form is filled out completely and try submitting again.");
		return;
	}
	//create json object
	var jsonOb = { name: rName,
				   email: rEmail,
				   phone: rPhone,
				   date: String(rDate),
				   time: String(rTime),
				   salon: String(rSalon),
				   address: rAddress,
				   salonid: sid,
				   stylist: stylist_id };

	//call the email confirmation function
	Parse.Cloud.run('bookAppointment', jsonOb, {
		success: function(confirm){
			console.log("email sent");
			console.log(confirm);
			alert("You have made your reservation! Check your email for confirmation.");
			return;
		},
		error: function(error){
			console.log("email didn't send");
			console.log(error.message);
			var eMessage = error.message;
			//check to see if it was an invalid email address
			if(eMessage.indexOf("valid email") > -1)
			{
				alert("Your email address is not valid. Check to make sure and try again");
				return;
			}
			else
			{
				
				alert("There was an error reserving your time slot.");
				return;
			}
		}
	});
}


function populateReservationInfo(){
	var x = $('.jumbotron');
	var name = getURLParams('salon');
	var date = getURLParams('date');
	var time = getURLParams('time');

	var namestr = "<h5 class=\"name\">"+name+"</h5>";
	var datestr = "<h5>Date: "+ date +"</h5>";
	var timestr = "<h5>Time: "+ time + "</h5>";

	x.append(namestr+datestr+timestr);
}
