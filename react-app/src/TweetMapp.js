import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import UpdatePage from './UpdatePage.js';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, LayersControl, ZoomControl, ScaleControl } from 'react-leaflet';
import { Spinner, Input, Card, Button, CardTitle, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Label } from 'reactstrap';
import DataTable from 'react-data-table-component';
// import ReactLoading from 'react-loading';
// import { Circle, FeatureGroup, LayerGroup, LayersControl, Rectangle } from 'react-leaflet';
import Draggable from 'react-draggable';
import Select from 'react-select';
// import { CardText, Form, FormGroup, Label } from 'reactstrap';
// import MarkerClusterGroup from 'react-leaflet-markercluster';

import './App.css';
import sarai_logo from './header_green.png';
import dost_logo from './dost-pcaarrd-uplb.png';
import map_marker from './map_marker.png';
import tweet_marker from './tweet_marker.png';

const { BaseLayer, /*Overlay*/ } = LayersControl
// const center = [51.505, -0.09]
// const rectangle = [[51.49, -0.08], [51.5, -0.06]]

var myIcon = L.icon({
    iconUrl: map_marker,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

var tweetIcon = L.icon({
    iconUrl: tweet_marker,
    iconSize: [55, 55],
    iconAnchor: [27.5, 55],
    popupAnchor: [0, -55]
});

const columns = [
  {
    name: 'Date',
    selector: 'created_at',
    sortable: true,
    grow: 15
  },
  {
    name: 'User',
    selector: 'user.screen_name',
    sortable: true,
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

const cropOptions = [
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

class TweetMapp extends Component {
  constructor(props){
    super(props)
    this.state = {
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

    this.setCrop = this.setCrop.bind(this)
    this.formSubmitted = this.formSubmitted.bind(this)
    this.valueChanged = this.valueChanged.bind(this)
    this.enterKeyword = this.enterKeyword.bind(this)
    this.searchTweetsEnter = this.searchTweetsEnter.bind(this)
    this.searchTweets = this.searchTweets.bind(this)
    this.geolocate = this.geolocate.bind(this)
    this.pushDatabase = this.pushDatabase.bind(this)
    this.loadTweets = this.loadTweets.bind(this)
    this.loadAllTweets = this.loadAllTweets.bind(this)
  }
  
  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
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
    this.loadAllTweets()
  }

  setCrop = (selectedOption) => {
    this.setState({ selectedOption });
    this.setState({
      selectedCrop: selectedOption.value
    })
  }

  formSubmitted = (event) => {
    event.preventDefault();
    console.log(this.state.userMessage);
  }

  valueChanged = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      userMessage: {
        ...prevState.userMessage,
        [name]: value
      }
    }))
  }

  enterKeyword = (event) => {
    this.setState({
      keyword: event.target.value
    })
  }

  searchTweetsEnter = (event) => {
    if(event.key === 'Enter'){
      this.searchTweets()
    }
  }

  searchTweets = (event) => {
    this.setState({
      isTweetsGeolocated: false,
      fetching: true,
      dataToDataTable: []
    })

    fetch('http://localhost:3001/get-tweets/' + this.state.keyword)
    .then(response=>{
      return response.json()
    })
    .then(body => {
      console.log(body.results)
      this.setState({
        tweets: body.results
      })
      // console.log(this.state.tweets.length)
      this.geolocate()
    })
  }

  // setCrop = (event) => {
  //   this.setState({
  //     selectedCrop: event.target.value,
  //     keyword: event.target.value
  //   })
  // }

  geolocate = (event) => {
    var i = 0
    var loc = ""

    this.state.tweets.forEach((element) => {
      if(element.place != null){
        loc = element.place.name
      }
      else{
        loc = element.user.location
      }
      loc = loc.replace(/\//g, " ")
      element.loc = loc

      fetch('http://localhost:3001/geocode/' + loc)
      .then(response=>{
        return response.json()
      })
      .then(body=>{
        element.geocode = body.results
        if(element.geocode.countryCode === "PH"){
          this.state.dataToDataTable.push(element)
        }
        console.log(i)
        i = i + 1
        if(i === this.state.tweets.length){
          this.setState({
            isTweetsGeolocated: true,
            fetching: false
          })
          this.pushDatabase()
        }
      })
    })
  }

  pushDatabase = (event) => {
    this.state.dataToDataTable.forEach((element) => {
      fetch('http://localhost:3001/pushdatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "tweet_id": element.id,
          "created_at": element.created_at,
          "screen_name": element.user.screen_name,
          "location": element.loc,
          "tweet_text": element.text,
          "latitude": element.geocode.latitude,
          "longitude": element.geocode.longitude,
          "crop": this.state.selectedCrop,
          "keyword_used": this.state.keyword
        })
      })
      .then(response=>{
        return response.json()
      })
      .then(body=>{
        console.log("Success.")
      })
    })
  }

  loadTweets = (event) => {
    this.setState({
      isTweetsGeolocated: false,
      fetching: true,
      dataToDataTable: []
    })

    fetch('http://localhost:3001/load-tweets/' + this.state.selectedCrop)
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
          }
        }
        
        element.id = e.tweet_id
        element.created_at = e.created_at
        element.user.screen_name = e.screen_name
        element.loc = e.location
        element.text = e.tweet_text
        element.geocode.latitude = e.latitude
        element.geocode.longitude = e.longitude
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

  loadAllTweets = (event) => {
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
          }
        }
        
        element.id = e.tweet_id
        element.created_at = e.created_at
        element.user.screen_name = e.screen_name
        element.loc = e.location
        element.text = e.tweet_text
        element.geocode.latitude = e.latitude
        element.geocode.longitude = e.longitude
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

  render() {
    const position = [this.state.location.lat, this.state.location.lng]
    return (
      <div className="app">
        <Navbar id="navbar" light expand="md">
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
        <Map className="map" center={position} zoom={this.state.zoom} zoomControl={false}>
          <LayersControl position="topright">
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
          <ScaleControl />
          <ZoomControl position="bottomleft" />
          { this.state.haveUsersLocation ?
            <Marker
              position={position}
              icon={myIcon}>
              <Popup>
                This is where you are.
              </Popup>
            </Marker> : ''
          }
          {
            this.state.isTweetsGeolocated === true &&
            this.state.dataToDataTable.map((e) => {
              var tweetPos = [e.geocode.latitude, e.geocode.longitude]
              return(
                <Marker
                  key={e.id}
                  position={tweetPos}
                  icon={tweetIcon}>
                  <Popup>
                    {e.text}
                  </Popup>
                </Marker>
              )
            })
          }
        </Map>
        <Draggable>
          <Card body className="message-form">
            <CardTitle>Tweet Map</CardTitle>
            <Select
              value={this.state.selectedOption}
              onChange={this.setCrop}
              options={cropOptions}
            />
            <UncontrolledDropdown>
              <DropdownToggle caret>Select Crop...</DropdownToggle>
              <DropdownMenu>
                <DropdownItem value="Rice" onClick={this.setCrop}>Rice</DropdownItem>
                <DropdownItem value="Corn" onClick={this.setCrop}>Corn</DropdownItem>
                <DropdownItem value="Banana" onClick={this.setCrop}>Banana</DropdownItem>
                <DropdownItem value="Coconut" onClick={this.setCrop}>Coconut</DropdownItem>
                <DropdownItem value="Coffee" onClick={this.setCrop}>Coffee</DropdownItem>
                <DropdownItem value="Cacao" onClick={this.setCrop}>Cacao</DropdownItem>
                <DropdownItem value="Sugarcane" onClick={this.setCrop}>Sugarcane</DropdownItem>
                <DropdownItem value="Tomato" onClick={this.setCrop}>Tomato</DropdownItem>
                <DropdownItem value="Soybean" onClick={this.setCrop}>Soybean</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <br/>
            {
              this.state.selectedCrop !== "" &&
              <div>
                Selected Crop: {this.state.selectedCrop}
                <br/>
                Last Updated:
                <br/>
                <br/>
                Keyword: {this.state.keyword}
                <Input placeholder="Change Keyword..." onChange={this.enterKeyword} onKeyDown={this.searchTweetsEnter} onMouseDown={e => e.stopPropagation()}></Input>
                <br/>
                <Button color="info" onClick={this.searchTweets}>Update</Button>
                &nbsp;
                <Button color="info" onClick={this.loadTweets}>Load Tweets</Button>
              </div>
            }
          </Card>
        </Draggable>
        {
          this.state.isTweetsGeolocated === true &&
          <DataTable
            title="Tweet Table"
            columns={columns}
            data={this.state.dataToDataTable}
            responsive={true}
            pagination={true}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30, 50]}
          />
        }
        {
          this.state.fetching === true &&
          <div>
            {/*<ReactLoading type="spin" color="#000000" height={'5%'} width={'5%'} />*/}
            <Spinner color="info" />
            <br/>
            <Label>Fetching Data...</Label>
          </div>
        }
        <UpdatePage/>
        {/*{
          this.state.tweets.map((e) => {
            if(e.place != null){
              return <h3 key={e.id}>{e.place.name}</h3>
            }
            else{
              return <h3 key={e.id}>{e.user.location}</h3>
            }
          })
        }*/}
        {/*{this.state.keyword}
        <input placeholder="enter keyword..." onChange={this.enterKeyword}></input>
        <button onClick={ this.searchTweets }>test</button>
        {this.state.tweets.length}*/}
      </div>
    );
  }
}

export default TweetMapp;

// get keyword stored in database after selecting crop
// change the keyword stored in database upon updating
// update "last updated timestamp"
// update database tweets


// "toDelete", delete all non-PH related