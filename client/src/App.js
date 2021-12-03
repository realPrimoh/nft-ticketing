import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import Web3 from 'web3';
import Festival from './components/Festival';
import Purchase from './components/Purchase';
import MyTickets from './components/MyTickets';
import SecondaryMarket from './components/SecondaryMarket';
import Resell from './components/Resell';

class App extends Component {

  constructor() {
    super();
    this.state = {
      account: null
    }

    new Promise((resolve, reject) => {
      if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        window.ethereum.enable()
          .then(() => {
            let web = new Web3(window.ethereum);
            resolve(
              web
            );
          })
          .catch(e => {
            reject(e);
          });
          
        web3.eth.getCoinbase().then((val) => {
          this.setState({account: val?.substr(0,5)});
          // this.state.account = val;
          web3.eth.getBalance(val).then(c => console.log('balance', c));
        })
        
        return;
      }
      if (typeof window.web3 !== 'undefined') {
        return resolve(
          new Web3(window.web3.currentProvider)
        );
      }
      resolve(new Web3('http://127.0.0.1:8545'));
    });

    window.ethereum.on('accountsChanged', function () {
      window.location.reload();
    });
  }

  render() {
    return (
      <Router>

        <div >
          <ReactNotification />
          <nav style={{ padding: '0px 30px 0px 30px' }}>
            <div class="nav-wrapper" >
              <a href="/buyTickets" class="brand-logo left">NFTicketmaster</a>
              <ul class="right hide-on-med-and-down 10" >
                <div>
                  <li> <Link to="/createEvent">Create Event</Link> </li>
                  <li> <Link to="/buyTickets">Buy Tickets</Link> </li>
                  <li> <Link to="/resale">Ticket Resale</Link> </li>
                  <li> <Link to="/tickets">My Tickets</Link> </li>
                  <li >
                    You're logged in as: {this.state.account}...
                  </li>
                </div>

              </ul>
            </div>
          </nav>

          <Switch>
            <Route path="/createEvent" component={Festival} />
            <Route path="/buyTickets" component={Purchase} />
            <Route path="/resale" component={SecondaryMarket} />
            <Route path="/tickets" component={MyTickets} />
            <Route path="/resell" component={Resell} />
          </Switch>
        </div>

      </Router >
    )
  }
}

export default App;
