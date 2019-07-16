const express = require('express');                       // required npm packages
const app = express();
const mysql = require('mysql');
const saltRounds = 10;
const expressValidator = require('express-validator');
const jwt = require('jsonwebtoken');
var Storage = require('dom-storage');
var multer = require('multer');
const path = require('path');
const twit = require('twit');
var NodeGeocoder = require('node-geocoder');

var T = new twit({                                            // required developer keys to use twitter api
  consumer_key: 'mEMCDT2bJHzCzP77SA4W1czkB',
  consumer_secret: 'a6LvR78Bao3NluPXlKytT2uRUBcJy5Fv3GZ3HErpjAALdpLG5P',
  access_token: '1108281543342972928-390zynjFLw4UYPlLJY0iroEv3bcK73',
  access_token_secret: 'zO6GCvvhFhl7YZ07PqqmuY8wp3rTEpFgNfUl47iwazSCr',
  timeout_ms: 60 * 1000,
  strictSSL: true,
})

var options = {                                      // required developer keys to use mapquest api
  provider: 'mapquest',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'P8AmJBXRcBHptcLonGc7qDFF86Jrp4o9', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);         // instantiates geocoder

const mysqlConnection = mysql.createConnection({        // connects to the mysql database
	host: 'localhost',
	user: 'root',
	password: 'useruser',
	database: 'tweets',
	multipleStatements: true,
  charset: 'utf8mb4'
});

mysqlConnection.connect((err)=>{
	if(!err)
		console.log('Database connection succeeded.');
	else
		console.log('Database connection failed \n Error: ' + JSON.stringify(err, undefined, 2));
});

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.get('/', (req, res) => {                      // validates if server is running
	console.log('connected!');
 	res.send({message: 'APi is working'});
});

app.get('/get-tweets/:keyword', (req, res)=>{       // uses the twitter api to retrieve tweets
	const keyword = req.params.keyword               // keyword is obtained from parameter

  T.get('search/tweets', { q: keyword, count: 100, geocode: "13.476717,121.903219,700mi", exclude: "retweets" }, function(err, data, response) {
  // keyword is used, 100 tweets (max), coordinates of Marinduque (geographical center of the philippines) used, with 700 miles as radius
    if(!err){
      console.log("Tweets Retrieved.")
      return res.json({
        results: data.statuses                // returns the retrieved tweets
      })
    }
  })
})

app.get('/geocode/:location', (req, res)=>{     // uses the mapquest api to get tweet coordinates
	const location = req.params.location       // location is obtained from parameter

	geocoder.geocode(location, function(err, data) {       // mapquest api
		  var returnVal = {                       // initializes a default return value
	      formattedAddress: '',
	      latitude: 0,
	      longitude: 0,
	      country: null,
	      city: '',
	      stateCode: '',
	      zipcode: '',
	      streetName: '',
	      streetNumber: null,
	      countryCode: '',
	      provider: 'mapquest'
	    }

	    if(!err){
		  	data.forEach(function(element){        // traverses through array of results
		  		if(element.countryCode === "PH"){         // if element location is within the philippines
		  			returnVal = element              // sets it as return value
		  		}
		  	})

		  	return res.json({
		  		results: returnVal          // returns the value
		  	})
		  }
	    else{
	      return res.json({
	        results: returnVal
	      })
	    }
	});
})

app.get('/load-tweets/:selectedcrop', (req, res) => {       // pulls tweets from database
  const crop = req.params.selectedcrop                  // crop is obtained from parameter
  const find_tweets_query = 'select * from tweet_table where crop = ?'      // mysql query for getting tweets
  const errors = []
  mysqlConnection.query(find_tweets_query, [crop], (err, results) => {    // searches the mysql database
    if(!err){
      return res.json({           // returns the tweets obtained from database
        success: true,
        data: results
      })
    }
    return res.json({
      success: false
    })
  })
})

app.get('/load-all-tweets', (req, res) => {        // same process with load-tweets, but with no crop passed in url parameter
  const find_tweets_query = 'select * from tweet_table'
  const errors = []
  mysqlConnection.query(find_tweets_query, (err, results) => {
    if(!err){
      return res.json({
        success: true,
        data: results
      })
    }
    return res.json({
      success: false
    })
  })
})

app.post('/pushdatabase', (req, res)=>{         // updates the mysql database with retrieved tweets
 const {tweet_id, created_at, screen_name, location, tweet_text, latitude, longitude, id_str, crop, keyword_used} = req.body          // sets variable values from request body
 const check_query = 'insert into tweet_table (tweet_id, created_at, screen_name, location, tweet_text, latitude, longitude, id_str, crop, keyword_used) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'     // mysql query for updating the tweet table
 const errors = []
 mysqlConnection.query(check_query, [tweet_id, created_at, screen_name, location, tweet_text, latitude, longitude, id_str, crop, keyword_used], (err, results) => {       // updates the mysql database
  if(!err){
    console.log("Tweet details successfully saved.")        // returns success message if there are no errors
    return res.json({
      success: true
    })
  }
  console.log("--" + err)                            // else, prints error message
  return res.json({
    success: false
   })
 })
})

app.listen(3001, ()=> console.log('Express server running at port number 3001'));       // notification that the server is up and running