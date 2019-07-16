import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import User from './User.js';
import Admin from './Admin.js';

import './App.css';

class App extends Component {

	render() {
		return (
	      <div className="app">
	        <Router>
      			<Route exact={true} path="/" component={User}/>
	      		<Route exact={true} path="/admin" component={Admin}/>
      		</Router>
	      </div>
		);
	}
}

export default App;