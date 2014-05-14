Parse.initialize("o6UHd0P7UT2nyRw8Djmz8YwxG6copYOr2DjhGpoA", "1WDfNgPeu4d8Qc9bHyeNMVOPkvBVQ7mmYLnu53pD");

$(function() {
    var salonQuery = new Parse.Query('Salons');
    salonQuery.find({
        success: function(salonList) {
            var availableSalons = [];
            for (var i = 0; i < salonList.length; i++) {
                var salon = salonList[i].get('SalonName')
                availableSalons.push(salon);
            }
            var uniqueSalons = availableSalons.filter(function(elem, index, self) {
                    return index == self.indexOf(elem);
            })
            console.log(uniqueSalons);
            $( "#search" ).autocomplete({
                minLength: 2,
                source: uniqueSalons,
                messages: {
                    noResults: '',
                    results: function() {}
                }
            });
        },
        error: function(salonList, error) {
            console.log('Error');
        }
    });
});
