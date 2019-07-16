import React, { Component } from 'react';				// import declarations
import { Map, TileLayer, Marker, Popup, LayersControl, ZoomControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import { Spinner, Card, Button, CardTitle, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Label } from 'reactstrap';
import DataTable from 'react-data-table-component';
import Draggable from 'react-draggable';
import Select from 'react-select';
import './UserAdmin.css';

import sarai_logo from './header_green.png';						// import images
import dost_logo from './dost-pcaarrd-uplb.png';
import app_logo from './app_logo.png';
import map_marker from './map_marker.png';
import rice_marker from './rice_marker.png';
import corn_marker from './corn_marker.png';
import banana_marker from './banana_marker.png';
import coconut_marker from './coconut_marker.png';
import coffee_marker from './coffee_marker.png';
import cacao_marker from './cacao_marker.png';
import sugarcane_marker from './sugarcane_marker.png';
import tomato_marker from './tomato_marker.png';
import soybean_marker from './soybean_marker.png';

const { BaseLayer } = LayersControl					// for leaflet map layer control

const myIcon = L.icon({					// instantiates icons for markers
    iconUrl: map_marker,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const riceIcon = L.icon({
    iconUrl: rice_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const cornIcon = L.icon({
    iconUrl: corn_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const bananaIcon = L.icon({
    iconUrl: banana_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const coconutIcon = L.icon({
    iconUrl: coconut_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const coffeeIcon = L.icon({
    iconUrl: coffee_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const cacaoIcon = L.icon({
    iconUrl: cacao_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const sugarcaneIcon = L.icon({
    iconUrl: sugarcane_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const tomatoIcon = L.icon({
    iconUrl: tomato_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const soybeanIcon = L.icon({
    iconUrl: soybean_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const columns = [						// columns to be used for data table
  {
    name: 'Date',
    selector: 'created_at',
    sortable: true,
    grow: 15
  },
  {
    name: 'Location',
    selector: 'loc',
    sortable: true,
    grow: 15
  },
  {
    name: 'Tweet',
    selector: 'text',
    sortable: true,
    grow: 100
  }
]

const cropOptions = [							// crop options
  { value: '', label: 'All'},
  { value: 'Rice', label: 'Rice' },
  { value: 'Corn', label: 'Corn' },
  { value: 'Banana', label: 'Banana' },
  { value: 'Coconut', label: 'Coconut' },
  { value: 'Coffee', label: 'Coffee' },
  { value: 'Cacao', label: 'Cacao' },
  { value: 'Sugarcane', label: 'Sugarcane' },
  { value: 'Tomato', label: 'Tomato' },
  { value: 'Soybean', label: 'Soybean' },
];

class User extends Component {
	state = {									// state initialization
		location: {
			lat: 51.505,
			lng: -0.09,
		},
	    haveUsersLocation: false,
	    zoom: 2,
	    userMessage: {
	      name: '',
	      message: ''
	    },
	    selectedCrop: "",
	    keyword: "",
	    tweets: [],
	    isTweetsGeolocated: false,
	    fetching: false,
	    dataToDataTable: [],
	    selectedOption: null,
	}

	componentDidMount() {
		navigator.geolocation.getCurrentPosition((position) => {		// gets current location of user
			this.setState({
				location: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
        haveUsersLocation: true,
        zoom: 13
			});
		}, () => {
      console.log('uh oh... they didnt give us their location...');
      fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(location => {
          this.setState({
            location: {
              lat: location.latitude,
              lng: location.longitude
            },
            haveUsersLocation: true,
            zoom: 13
          });
        });
    });
    this.loadAllTweets()							// calls the function loadAllTweets() upon loading webpage
	}

	setCrop = (selectedOption) => {					// sets the crop according to user choice in dropdown
    this.setState({ selectedOption });
    this.setState({
      selectedCrop: selectedOption.value
    })
  }

  loadTweets = (event) => {					// loads the tweet of the crop depending on user choice
    if(this.state.selectedCrop === ''){		// calls the function loadAllTweets() if selected crop is empty string
      this.loadAllTweets()
    }
    else{
      this.setState({					// sets the values of the states accordingly
        isTweetsGeolocated: false,
        fetching: true,
        dataToDataTable: []
      })

      fetch('http://localhost:3001/load-tweets/' + this.state.selectedCrop)		// obtains the tweets from database using the server, with selected crop as parameter
      .then(response=>{
        return response.json()
      })
      .then(body => {
        var arr = body.data			// stores the retrieved data (tweets) in temporary array
        var i = 0				// counter

        arr.forEach((e) => {		// traverses through the array
          var element = {		// initializes an element that will later be pushed
            id: "",
            created_at: "",
            user: {
              screen_name: ""
            },
            loc: "",
            text: "",
            geocode: {
              latitude: "",
              longitude: ""
            },
            crop: "",
            id_str: ""
          }
          
          element.id = e.tweet_id						// sets the field of the initialized element corresponding to the current array element
          element.created_at = e.created_at
          element.user.screen_name = e.screen_name
          element.loc = e.location
          element.text = e.tweet_text
          element.geocode.latitude = e.latitude
          element.geocode.longitude = e.longitude
          element.crop = e.crop
          element.id_str = e.id_str
          this.state.dataToDataTable.push(element)

          i = i + 1						// increments counter
          if(i === arr.length){			// if all elements have been traversed
            this.setState({			// sets the values of the states accordingly
              isTweetsGeolocated: true,
              fetching: false
            })
          }
        })
      })
    }
  }

  clickRow = (event) => {			// function that will be called if row in data table is clicked
    window.location = "https://twitter.com/statuses/" + event.id_str		// redirects the browser to the link of the tweet
  }

  loadAllTweets = (event) => {				// same process with function loadTweets(), but with no selected crop passed as url parameter
    this.setState({
      isTweetsGeolocated: false,
      fetching: true,
      dataToDataTable: []
    })

    fetch('http://localhost:3001/load-all-tweets')
    .then(response=>{
      return response.json()
    })
    .then(body => {
      var arr = body.data
      var i = 0

      arr.forEach((e) => {
        var element = {
          id: "",
          created_at: "",
          user: {
            screen_name: ""
          },
          loc: "",
          text: "",
          geocode: {
            latitude: "",
            longitude: ""
          },
          crop: "",
          id_str: ""
        }
        
        element.id = e.tweet_id
        element.created_at = e.created_at
        element.user.screen_name = e.screen_name
        element.loc = e.location
        element.text = e.tweet_text
        element.geocode.latitude = e.latitude
        element.geocode.longitude = e.longitude
        element.crop = e.crop
        element.id_str = e.id_str
        this.state.dataToDataTable.push(element)

        i = i + 1
        if(i === arr.length){
          this.setState({
            isTweetsGeolocated: true,
            fetching: false
          })
        }
      })
    })
  }

	render(){
		const position = [this.state.location.lat, this.state.location.lng]			// coordinates of the user location
		return(
			<div className="app">
				<Navbar id="navbar" light expand="md">			{/* header similar to the sarai.ph website */}
		          <NavbarBrand href="http://sarai.ph/"><img className="main-logo" src={sarai_logo} alt="sarai-logo"/></NavbarBrand>
		          <NavbarToggler onClick={this.toggle} />
		          <Collapse isOpen={this.state.isOpen} navbar>
		            <Nav className="ml-auto" navbar>
		              <NavItem>
		                <NavLink className="navbar-link" href="http://sarai.ph/about-us">About Us</NavLink>
		              </NavItem>
		              <NavItem>
		                <NavLink className="navbar-link" href="https://sarai-community.net">Sarai Community</NavLink>
		              </NavItem>
		              <UncontrolledDropdown nav inNavbar>
		                <DropdownToggle className="navbar-link" nav caret>
		                  Crops
		                </DropdownToggle>
		                <DropdownMenu right>
		                  <DropdownItem className="navbar-link">
		                    <a id="rice-dropdown-link" href="https://sarai-community.net/?fbclid=IwAR1CKtkO0bjDSeoX_cYHCEd4OElRshxjpCdgCKWGuVnBtDvjnUWnIA4tyh0#1542162911043-4a046c63-2794">Rice</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="corn-dropdown-link" href="https://sarai-community.net/?fbclid=IwAR1CKtkO0bjDSeoX_cYHCEd4OElRshxjpCdgCKWGuVnBtDvjnUWnIA4tyh0#1542177442034-6cd28c37-26af">Corn</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="banana-dropdown-link" href="http://sarai.ph/icm-banana">Banana</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="coconut-dropdown-link" href="http://sarai.ph/icm-coconut">Coconut</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="coffee-dropdown-link" href="http://sarai.ph/icm-coffee">Coffee</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="cacao-dropdown-link" href="http://sarai.ph/icm-cacao">Cacao</a>
		                  </DropdownItem>
		                </DropdownMenu>
		              </UncontrolledDropdown>
		              <UncontrolledDropdown nav inNavbar>
		                <DropdownToggle className="navbar-link" nav caret>
		                  Maps
		                </DropdownToggle>
		                <DropdownMenu right>
		                  <DropdownItem className="navbar-link">
		                    <a id="suitability-dropdown-link" href="http://139.59.125.198/suitability-maps">Suitability Maps</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="normalized-dropdown-link" href="http://139.59.125.198/ndvi">Normalized Difference Vegetation Index</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="rainfall-dropdown-link" href="http://139.59.125.198/rainfall-maps">Rainfall Map</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="svtr-dropdown-link" href="http://139.59.125.198/agri-drought">SVTR Map</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="enhanced-dropdown-link" href="http://139.59.125.198/evi">Enhanced Vegetation Index</a>
		                  </DropdownItem>
		                </DropdownMenu>
		              </UncontrolledDropdown>
		              <UncontrolledDropdown nav inNavbar>
		                <DropdownToggle className="navbar-link" nav caret>
		                  Services
		                </DropdownToggle>
		                <DropdownMenu right>
		                  <DropdownItem className="navbar-link">
		                    <a id="rainfall-dropdown-link" href="http://sarai.ph/heat-map-rainfall-outlook">Rainfall Outlook</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="suitability-dropdown-link" href="http://sarai.ph/suitability-gallery">Suitability</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="drought-dropdown-link" href="http://sarai.ph/drought">Drought Forecast</a>
		                  </DropdownItem>
		                  <DropdownItem className="navbar-link">
		                    <a id="weather-dropdown-link" href="http://sarai.ph/weather-monitoring">Weather Monitoring</a>
		                  </DropdownItem>
		                </DropdownMenu>
		              </UncontrolledDropdown>
		              <img src={dost_logo} className="dost-logo" alt="dost-logo"/>
		            </Nav>
		          </Collapse>
		        </Navbar>
		  			<Map className="map" center={position} zoom={this.state.zoom} zoomControl={false}>		{/* react-leaflet map */}
		          {/* for user to select desired layer */}
		          <LayersControl position="topright">
		          	{/* 3 layers (Mapnik, BlackAndWhite, OpenTopoMap) */}
		            <BaseLayer checked name="OpenStreetMap.Mapnik">
		              <TileLayer
		                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		              />
		            </BaseLayer>
		            <BaseLayer name="OpenStreetMap.BlackAndWhite">
		              <TileLayer
		                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		                url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
		              />
		            </BaseLayer>
		            <BaseLayer name="OpenStreetMap.OpenTopoMap">
		              <TileLayer
		                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
		              />
		            </BaseLayer>
		          </LayersControl>
		          <ScaleControl />				{/* scale control */}
		          <ZoomControl position="bottomleft" />		{/* zoom control */}
		          { this.state.haveUsersLocation ?				// places marker if user location is obtained
		            <Marker
		              position={position}
		              icon={myIcon}>
		              <Popup>
		                This is where you are.
		              </Popup>
		            </Marker> : ''
		          }
		          {
		            this.state.isTweetsGeolocated === true &&			// places tweet markers if all tweet locations have been obtained
		            this.state.dataToDataTable.map((e) => {				// maps data of tweets from array
		              var tweetPos = [e.geocode.latitude, e.geocode.longitude]		// variables required in creating marker
                  var tweetIcon = myIcon
                  var tweetLink = "https://twitter.com/statuses/" + e.id_str

                  switch(e.crop){						// switch case of icon, image used as icon depends on crop
                    case "Rice":
                      tweetIcon = riceIcon
                      break
                    case "Corn":
                      tweetIcon = cornIcon
                      break
                    case "Banana":
                      tweetIcon = bananaIcon
                      break
                    case "Coconut":
                      tweetIcon = coconutIcon
                      break
                    case "Coffee":
                      tweetIcon = coffeeIcon
                      break
                    case "Cacao":
                      tweetIcon = cacaoIcon
                      break
                    case "Sugarcane":
                      tweetIcon = sugarcaneIcon
                      break
                    case "Tomato":
                      tweetIcon = tomatoIcon
                      break
                    case "Soybean":
                      tweetIcon = soybeanIcon
                      break
                    default:
                      tweetIcon = myIcon
                  }

		              return(						// returns the marker
		                <Marker
		                  key={e.id}
		                  position={tweetPos}
		                  icon={tweetIcon}>
		                  <Popup>
		                    <a href={tweetLink}>{e.text}</a>		{/* marker popup is link to tweet */}
		                  </Popup>
		                </Marker>
		              )
		            })
		          }
		        </Map>
            <div className="card-bounds">				{/* div area as large as map where card can be dragged */}
            	{/* bounds of the draggable card */}
  		        <Draggable bounds="parent">
  		          <Card body className="message-form">
  		            <CardTitle><img className="app-logo" src={app_logo} alt="Tweet Mapp" draggable="false" /></CardTitle>		{/* logo */}
  		            <Label>Select Crop</Label>
  		            {/* select crop dropdown */}
  		            <Select
  		              value={this.state.selectedOption}
  		              onChange={this.setCrop}
  		              options={cropOptions}
  		            />
  		            <br/>
  		            <Button color="info" onClick={this.loadTweets} onMouseDown={e => e.stopPropagation()} >Load Tweets</Button>		{/* button that triggers loadTweets() function */}
  		          </Card>
  		        </Draggable>
            </div>
		        {
		          this.state.isTweetsGeolocated === true &&				// displays data table if all tweet locations have been obtained
		          <DataTable
		            title="Tweet Table"						// properties of data table
		            columns={columns}						// uses the columns array created earlier
		            data={this.state.dataToDataTable}		// uses the data from the array
                	onRowClicked={this.clickRow}			// property that triggers the clickRow() function if a row is clicked
		            responsive={true}
		            pagination={true}
		            paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30, 50]}
		          />
		        }
		        {
		        	this.state.fetching === true &&			// shows spinner and notification while fetching required data
		        	<div>
		            <Spinner color="info" />
		            <br/>
		        		<Label>Fetching Data...</Label>
		        	</div>
		        }
			</div>
		)
	}
}

export default User;