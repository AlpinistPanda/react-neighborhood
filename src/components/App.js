import React, { Component } from "react";
import ListVenues from "./ListVenues";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allVenues: require("./venues.json"), //  get venues json file
      map: "",
      infowindow: "",
      prevmarker: ""
    };


    this.initMap = this.initMap.bind(this);
    this.openInfoWindow = this.openInfoWindow.bind(this);
    this.closeInfoWindow = this.closeInfoWindow.bind(this);
  }

  componentDidMount() {
   // initalize the map
    window.initMap = this.initMap;

    // Asynchronously loading of the Maps
    loadMapJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCacmIGcWsolGnXLp71cBM_My9axyprocM&callback=initMap"
    );
  }

  /**
   * Initialise the map once the google map script is loaded
   */

  initMap() {
    var self = this;

    var mapview = document.getElementById("map");
    mapview.style.height = window.innerHeight + "px";
    var map = new window.google.maps.Map(mapview, {
      center: { lat: 1.29, lng: 103.85 },
      zoom: 14,
      mapTypeControl: false
    });

    var InfoWindow = new window.google.maps.InfoWindow({});

    window.google.maps.event.addListener(InfoWindow, "closeclick", function() {
      self.closeInfoWindow();
    });

    this.setState({
      map: map,
      infowindow: InfoWindow
    });

    window.google.maps.event.addDomListener(window, "resize", function() {
      var center = map.getCenter();
      window.google.maps.event.trigger(map, "resize");
      self.state.map.setCenter(center);
    });

    window.google.maps.event.addListener(map, "click", function() {
      self.closeInfoWindow();
    });

    var allVenues = [];
    this.state.allVenues.forEach(function(venue) {
      var longname = venue.name + " - " + venue.dancestyle;
      var marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(
          venue.latitude,
          venue.longitude
        ),
        animation: window.google.maps.Animation.DROP,
        map: map,
        name: venue.name,
        pic: venue.pic,
        notes: venue.notes,
        url: venue.url,
        day: venue.day
      });

      marker.addListener("click", function() {
        self.openInfoWindow(marker);
      });

      venue.longname = longname;
      venue.marker = marker;
      venue.display = true;
      allVenues.push(venue);
    });
    this.setState({
      allVenues: allVenues
    });
  }

  /**
   * Brings infowindow for selected marker
   * @param {object} location marker
   */

  openInfoWindow(marker) {
    this.closeInfoWindow();
    this.state.infowindow.open(this.state.map, marker);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    this.setState({
      prevmarker: marker
    });
    this.state.infowindow.setContent("Loading Data...");
    this.state.map.setCenter(marker.getPosition());
    this.state.map.panBy(0, -200);
    this.getMarkerInfo(marker);
  }

  /**
   * Wunderground API for weather forecast for the events
   */

  getMarkerInfo(marker) {
    var self = this;
    console.log(this.state.infowindow.location);

    // URL for the wunderground API
    var url =
    "http://api.wunderground.com/api/83e4eaf81392612c/forecast10day/q/Singapore/Singapore.json";

    fetch(url)
      .then(function(response) {
          console.log("fetched successfully")
        if (response.status !== 200) {
          self.state.infowindow.setContent("There is a problem");
          return;
        }

        // response
        response.json().then(function(data) {
           console.log(marker.name);

          var forecast10day = data.forecast.simpleforecast.forecastday[0];
          console.log(forecast10day);

          let d = new Date();
          let weather_data = data.forecast.txt_forecast;
          let dif = 0;

          if(d.getDay()<=marker.day){
              dif = marker.day - d.getDay();
          }
          if(d.getDay()>marker.day){
              dif = marker.day - d.getDay() + 7;
          }

          let weather = {
              weatherText: weather_data.forecastday[dif*2].fcttext_metric,
              weatherIcon: weather_data.forecastday[dif*2].icon_url
          };

          // Html for the info window

           var contentString = '<div class="info">'+
           '<div class="info-header">'+
           '<div class="info-img">'+
           '<img class="mainImg" src="'+marker.pic+'" height="100" width="100">'+
           '</div>'+
           '<div class="info-name">'+
           '<h3 class="firstHeading"><a href="'+marker.url+'">'+marker.name+'</a></h3>'+
           '</div>'+
           '</div>'+
           '<div class="content-row">'+
           '<div class="content">'+
           '<p>'+marker.notes+'</p>'+
           '<p>Forecast for next Event</p>'+
           '</div>'+
           '</div>'+
           '<div class="weather-row">'+
           '<div class="weather-icon">'+
           '<img src="'+weather.weatherIcon+'">'+
           '</div>'+
           '<div class="weather-text">'+
           '<p>'+weather.weatherText+'</p>'+
           '</div>'+
           '</div>'+
           '<div class="homepage-url-row">'+
           '<div class="homepage-url"><a href="'+self.url+'">Venue link</a></div>'+
           '</div>'+
           '<div>';

         self.state.infowindow.setContent(
           contentString  
         );
        });
      })
      .catch(function(err) {
        self.state.infowindow.setContent("Sorry data can't be loaded");
      });
  }

  /**
   * Closes the infowindow
   *
   * 
   */

  closeInfoWindow() {
    if (this.state.prevmarker) {
      this.state.prevmarker.setAnimation(null);
    }
    this.setState({
      prevmarker: ""
    });
    this.state.infowindow.close();
  }

  render() {
    return (
      <div>
        <ListVenues
          key="100"
          allVenues={this.state.allVenues}
          openInfoWindow={this.openInfoWindow}
          closeInfoWindow={this.closeInfoWindow}
        />
        <div id="map" />
      </div>
    );
  }
}

export default App;

/**
 * Loads google maps
 * @param {src} url of the google maps script
 */

function loadMapJS(src) {
  var ref = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = src;
  script.async = true;
  script.onerror = function() {
    document.write("Google Maps can't be loaded");
  };
  ref.parentNode.insertBefore(script, ref);
}