var model = {
    currentLocation: null,
    locationData: [{
            locationName: 'Regina',
            latLng: {
                lat: 50.433851,
                lng: -104.627931
            }
        },

        {
            locationName: 'Saskatoon',
            latLng: {
                lat: 52.133114,
                lng: -106.631046
            }
        },

        {
            locationName: 'Moose Jaw',
            latLng: {
                lat: 50.392286,
                lng: -105.534767
            }
        },

        {
            locationName: 'Katepwa',
            latLng: {
                lat: 50.694588,
                lng: -103.630001
            }
        },

        {
            locationName: 'Lumsden',
            latLng: {
                lat: 50.646767,
                lng: -104.866992
            }
        }
    ],
    visibleMarkers: []
};

var mapView = {



    addMapMarker: function(place, map, largeInfoWindow) {
        var markerOptions = {
            map: map,
            position: place.latLng,
            title: place.locationName,
            animation: google.maps.Animation.DROP,
        };

        place.marker = new google.maps.Marker(markerOptions);

        place.marker.addListener('click', function() {
            mapView.addAnimation(place.marker);
        });

        mapView.addInfoWindow(place.marker, largeInfoWindow);

    },

    addAnimation: function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1400);
        }
    },

    addInfoWindow: function(marker, largeInfoWindow) {
        marker.addListener('click', function() {
            mapView.populateInfoWindow(marker, largeInfoWindow);
        });
    },

    // Populate the info window of each marker
    populateInfoWindow: function(marker, infowindow) {

        var wikiurl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
            marker.title + '&format=json&callback=wikiCallback';

        var wikiRequestTimeout = setTimeout(function() {
            alert("failed to load wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiurl,
            dataType: "jsonp",

            success: function(response) {
                // Get some info
                var markerWikiInfo = (response[2]);
                // Check to make sure the infowindow is not already opened on this marker.
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;
                    // Insert the info
                    infowindow.setContent('<div>' + markerWikiInfo + '</div>');
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick', function() {
                        infowindow.setMarker = null;
                    });
                }
                clearTimeout(wikiRequestTimeout);
            },
        });
    }
};


var listView = {
    visiblePlaces: ko.observableArray(),
    userInput: ko.observable(''),

    init: function() {
        listView.transferMarkers();
        listView.buildMarkers();
        listView.visiblePlacesFirst();
        listView.filterMarkers();
    },

    transferMarkers: function() {
        model.locationData.forEach(function(place) {
            model.visibleMarkers.push(new listView.Place(place));
        });
    },


    buildMarkers: function() {
        var largeInfoWindow = new google.maps.InfoWindow();

        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 51.435289,
                lng: -106.235857
            },
            zoom: 8
        });

        model.visibleMarkers.forEach(function(place) {
            mapView.addMapMarker(place, map, largeInfoWindow);
        });
    },

    visiblePlacesFirst: function() {
        model.visibleMarkers.forEach(function(place) {
            listView.visiblePlaces.push(place);
        });
    },

    filterMarkers: function() {
        var searchInput = listView.userInput().toLowerCase();

        listView.visiblePlaces.removeAll();

        model.visibleMarkers.forEach(function(place) {
            place.marker.setVisible(false);

            if (place.locationName.toLowerCase().indexOf(searchInput) !== -1) {
                listView.visiblePlaces.push(place);
            }
        });


        listView.visiblePlaces().forEach(function(place) {
            place.marker.setVisible(true);
        });
    },


    Place: function(place) {
        this.locationName = place.locationName;
        this.latLng = place.latLng;
        this.marker = null;
    }
};


ko.applyBindings(listView);


function mapError() {
    alert("Error, Could not load");
}

function initMap() {
    listView.init();
}

function listClick(data) {
    var infoWindow = new google.maps.InfoWindow();
    data.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        data.marker.setAnimation(null);
    }, 1400);
    mapView.populateInfoWindow(data.marker, infowindow);
}
