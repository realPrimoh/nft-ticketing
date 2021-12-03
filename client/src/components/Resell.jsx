import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';
import { BrowserRouter as Router, Route, Link, Switch, useParams } from 'react-router-dom';

let web3;

class MyTickets extends Component {
  constructor() {
    super();

    this.state = {
      tickets: [],
      fests: [],
      ticket: null,
      fest: null,
      marketplace: null,
      price: null,
      test: null,
      activeFests: [],
      festData: [],
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    let festID = params.get('eventid');
    let ticketID = params.get('ticketid');
    console.log('params', ticketID);

    const initiator = await web3.eth.getCoinbase();
    const festDetails = await festivalFactory.methods.getFestDetails(festID).call({ from: initiator });
    console.log('festDetails', festDetails)
    this.setState({ fest: festID, festName:  festDetails[0], ticketID: ticketID, ticket: ticketID, marketplace: festDetails[6]});
  }

  onListForSale = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const { ticket, price, marketplace } = this.state;
      const nftInstance = await FestivalNFT(this.state.fest);
      await nftInstance.methods.setSaleDetails(ticket, web3.utils.toWei(price, 'ether'), marketplace).send({ from: initiator, gas: 6700000 });

      renderNotification('success', 'Success', `Ticket is listed for sale in secondary market!`);
    } catch (err) {
      console.log('Error while lisitng for sale', err);
      renderNotification('danger', 'Error', err.message.split(' ').slice(8).join(' '));
    }
  }

  onFestivalChangeHandler = async (e) => {
    try {
      const state = this.state;
      state[e.target.name] = e.target.value;
      this.setState(state);

      const { fest } = this.state;

      const initiator = await web3.eth.getCoinbase();
      const festDetails = await festivalFactory.methods.getFestDetails(fest).call({ from: initiator });

      this.setState({ marketplace: festDetails[4] });
    } catch (err) {
      console.log('Error while tickets for festival', err.message);
      renderNotification('danger', 'Error', 'Error while tickets for festival');
    }
  }

  inputChangedHandler = async (e) => {
      this.setState({price: e.target.value});
  }

  render() {
    return (
      <div class="container center" >
        <div class="row">
          <div class="container ">
            <div class="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>Resell Ticket</h5>
              <form class="" onSubmit={this.onListForSale}>

                <label class="left">Event</label>
                <input type="text" class="form-control" value={this.state.festName} disabled>
                </input>

                <label class="left">Ticket ID</label>
                <input type="text" class="form-control" value={this.state.ticketID} disabled>
                </input>

                <label class="left">Sale Price</label>
                <input id="price" placeholder="Sale Price" type="text" className="input-control" name="price" value={this.state.price} onChange={this.inputChangedHandler} />
                <br /><br />
                <button type="submit" className="custom-btn login-btn">List for Sale</button>
              </form>
              {this.state.price}
            </div>
          </div>
        </div>
      </div >
    )
  }
}

export default MyTickets;