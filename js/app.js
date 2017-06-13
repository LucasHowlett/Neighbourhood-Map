// Created an array list of loactions that will appear on our map //
var locationsData = [
    {
        name: 'Sparkys Family Restaurant',
        lat: 50.40584037032503,
        lng: -104.63804520901597,
        foursquare: '4c156c71127f9521f7042525',
        altDescription: 'Also known as the Sparkledome',
    },
    {
        name: 'Pizza Pizza',
        lat: 50.417880985180474,
        lng: -104.61953207287549,
        foursquare: '4bb54278ef159c74b88b74f7',
        altDescription: 'Hot and ready to go',
    },
    {
        name: 'Houston Pizza',
        lat: 50.48129281672004,
        lng: -104.66588481747148,
        foursquare: '4bb55102941ad13acc1d1ee3',
        altDescription: 'Real Good Food',
    },
    {
        name: 'Tumblers Pizza',
        lat: 50.40798702150921,
        lng: -104.61024372050086,
        foursquare: '4bbb30313db7b713c501249a',
        altDescription: 'Serving Regina Familys good food since 1979',
    },
    {
        name: 'Regent Family Restaurant',
        lat: 50.4742647934236,
        lng: -104.6363707656719,
        foursquare: '4c34a13f213c2d7f22c3385d',
        altDescription: 'Proud to serve Regina for over 30 years',
    },
    {
        name: 'The Open Tap',
        lat: 50.49601,
        lng: -104.64232849999999,
        foursquare: '4bdf1d8de75c0f4705f0c903',
        altDescription: 'Enjoy the good life at the Tap!',
    },
    {
        name: 'East Side Marios',
        lat: 50.44679255677195,
        lng: -104.64232849999999,
        foursquare: '4b81b634f964a52051b930e3',
        altDescription: 'Home Of All-You-Can-Eat‎',
    },
    {
        name: 'Copper Kettle',
        lat: 50.447613705343315,
        lng: -104.61067164194334,
        foursquare: '4bb9188e53649c7451b547fb',
        altDescription: 'Always a terrific lunch buffet',
    },
    {
        name: 'Bocados',
        lat: 50.4462445,
        lng: -104.571313,
        foursquare: '4bd1e3e777b29c748e7f8d82',
        altDescription: 'Laid-back eatery with live music',
    },
    {
        name: 'Boston Pizza',
        lat: 50.44648064015329,
        lng: -104.53598499298096,
        foursquare: '4c8ffa610b9e3704a2d3635e',
        altDescription: 'Your among friends',
    }
];

// Our Foursquare API information //

var foursquare = {
    clientId: 'MZLMMHMDYLLSPW0ACCE3DMRMHUQEYGIOPXH5ITOJBTD0D4ON',
    clientSecret: '1G32AEUJHLJJ0JD1N54L3E4FQRR1XSPGPEKCWECKSKLT0HPB',
}

// Created a variable for the map view //
var mapView;

// Created a vairable for the information window //
var informationWindow;

// Foursquare information window Api call content display //
// Using Array.prototype.join() method on the location details //
function Venue(data) {
    this.name = data.name;
    this.address = data.location.formattedAddress.join(' // ');
    this.photos = data.photos.groups[0].items;
}

// Activate knockout once google map script returns //
function initMap() {
    ko.applyBindings(new viewModel());
}

// Created an error message to appear if google maps fails to load //
function mapError() {
    alert("Error, Could not load Google Maps");
}

// Created our viewModel for the app //
var viewModel = function() {
    var self = this;
    // Centers map at wascana lake location in Regina //
    self.mapCenter = {lat: 50.43, lng: -104.61};

    // Handles the location options displayed in the view list //
    self.locationData = ko.observableArray();
    // Handles the search filter text field
    self.filterSearch = ko.observable('');

// Handles displayed markers and options available in list view //
self.filteredLocationsData =  ko.computed(function() {
    return self.locationData().filter(function(ld) {
        lowerCaseName = ld.name.toLowerCase();
        var isSame = lowerCaseName.indexOf(self.filterSearch().toLowerCase()) !== -1;
        ld.marker.setVisible(isSame);
        return isSame;
    }, this);
}, this);

// Re-center our map //
map = new google.maps.Map(document.getElementById('map'), {
    center: self.mapCenter,
    zoom: 13
});

// Loop over array and handles setting markers //
for (var i = 0, wid = locationsData.length; i < wid; i++) {
    // Set id value to i //
    locationsData[i].id = i;
    var ld = new mapModel(locationsData[i]);
    self.locationData.push(ld);
}


// Click on the link //
chooseLocationsData = function(link) {
    google.maps.event.trigger(link.marker, 'click');
  };
}

// Our model for location data with marker, JSON call //
var mapModel = function(ldData) {
    var self = this;

    self.name = ldData.name;
    self.id = ldData.id;

    // Handles content for the information window //
    self.contentFoursquare = ko.observable();

    // Gather data about the venue from the Foursquare Api in JSON formatting //
    $.getJSON('https://api.foursquare.com/v2/venues/' + ldData.foursquare + '?v=20170612&client_id=MZLMMHMDYLLSPW0ACCE3DMRMHUQEYGIOPXH5ITOJBTD0D4ON&client_secret=1G32AEUJHLJJ0JD1N54L3E4FQRR1XSPGPEKCWECKSKLT0HPB', function(allData) {
        var mapVenue = $.map(allData.response, function(item) {
            return new Venue(item)
        });

        var contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h2 id=firstHeading" class="firstHeading">' + mapVenue[0].name + '</h2>' +
            '<div id="bodyContent">' +
            '<p>' + ldData.altDescription + '<br>' + mapVenue[0].address + '</p>' +
            '<div class="imageList">';

        // Adding images from the photos array for mapVenue //
        for (var p = 0, wid = mapVenue[0].photos.length;
            (p < wid) && (p < 2); p++) {
            contentString += '<img src="' + mapVenue[0].photos[p].prefix + '100x100' + mapVenue[0].photos[p].suffix + '"/> ';
        }

        contentString +=
            '</div>' +
            '<p>Venue data provided by  <a href="https://foursquare.com/v/' +
            ldData.foursquare + '?ref=MZLMMHMDYLLSPW0ACCE3DMRMHUQEYGIOPXH5ITOJBTD0D4ON' +
            '">Foursquare API</a>.<br>Map data ©2017 <a href="https://maps.google.com">Google</a>.' +
            '</p>' +
            '</div>' +
            '</div>';
        self.contentFoursquare(contentString);

    }).fail(function() {
        // Error handling connection to Foursquare //
        var contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h2 id="firstHeading" class="firstHeading">' + ldData.name + '</h2>' +
            '<div id="bodyContent">' +
            '<p>' + ldData.altDescription + '</p>' +
            '</div>' +
            '<p><i>Error, Venue data could not be loaded from Foursquare.</i></p>' +
            '</div>' +
            '</div>';
        self.contentFoursquare(contentString);
    });

    // Handles creating a new map marker //
    self.marker = new google.maps.Marker({
        map: map,
        position: {
            lat: ldData.lat,
            lng: ldData.lng
        },
        content: ldData.altDescription,
    });

    // Handles the listener on the map marker which makes it animate bounce //
    self.marker.addListener('click', function() {
        var bouncingMarker = this
        bouncingMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            bouncingMarker.setAnimation(null);
        }, 700);

        if ((informationWindow) && (informationWindow.open)) {
            informationWindow.close();
        }

        informationWindow = new google.maps.InfoWindow({
            content: self.contentFoursquare(),
        });

        // Handles recentering the map //
        map.setCenter(new google.maps.LatLng(bouncingMarker.position.lat(), bouncingMarker.position.lng()));
        // Handles opening the information window //
        informationWindow.open(map, bouncingMarker);
    });

    // Handles adding the marker to the map //
    self.marker.setMap(map);
}
