import React, { Component } from "react";
import Venue from "./Venue";

class ListVenues extends Component {

  constructor(props) {
    super(props);
    this.state = {
      locations: "",
      query: "",
      suggestions: true
    };

    this.filterLocations = this.filterLocations.bind(this);
  }

  /**
   * Filter Locations based on user query
   */

  filterLocations(event) {
    this.props.closeInfoWindow();
    const { value } = event.target;
    var locations = [];
    this.props.allVenues.forEach(function(location) {
      if (location.longname.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        location.marker.setVisible(true);
        locations.push(location);
      } else {
        location.marker.setVisible(false);
      }
    });

    this.setState({
      locations: locations,
      query: value
    });
  }

  componentWillMount() {
    this.setState({
      locations: this.props.allVenues
    });
  }


  render() {
    var venueList = this.state.locations.map(function(listItem, index) {
      return (
        <Venue
          key={index}
          openInfoWindow={this.props.openInfoWindow.bind(this)}
          data={listItem}
        />
      );
    }, this);

    return (
      <div className="search-area">
        <div className="title"> 
          <p>Singapore Dance Venues </p>
        </div>
        <input
          role="search"
          aria-labelledby="filter"
          id="search-field"
          className="search-input"
          dancestyle="text"
          placeholder="Filter"
          value={this.state.query}
          onChange={this.filterLocations}
        />
        <ul className="venue-list">
          {this.state.suggestions && venueList}
        </ul>
      </div>
    );
  }
}

export default ListVenues;