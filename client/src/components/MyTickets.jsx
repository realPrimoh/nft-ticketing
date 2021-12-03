import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

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
      festData: []
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateFestivals();
  }

  onListForSale = async (ticket, price, marketplace) => {
    try {
      const initiator = await web3.eth.getCoinbase();
      // const { ticket, price, marketplace } = this.state;
      const nftInstance = await FestivalNFT(this.state.fest);
      await nftInstance.methods.setSaleDetails(ticket, web3.utils.toWei(price, 'ether'), marketplace).send({ from: initiator, gas: 6700000 });

      renderNotification('success', 'Success', `Ticket is listed for sale in secondary market!`);
    } catch (err) {
      console.log('Error while lisitng for sale', err);
      renderNotification('danger', 'Error', err.message.split(' ').slice(8).join(' '));
    }
  }

  updateFestivals = async () => {
    try {
      let festData = []
      const initiator = await web3.eth.getCoinbase();
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });
      if (activeFests.length == 0) {
        return;
      }
      const festDetails = await festivalFactory.methods.getFestDetails(activeFests[0]).call({ from: initiator });
      const renderData = await Promise.all(activeFests.map(async (fest, i) => {
        const festDetails = await festivalFactory.methods.getFestDetails(activeFests[i]).call({ from: initiator });
        const nftInstance = await FestivalNFT(fest);
        const tickets = await nftInstance.methods.getTicketsOfCustomer(initiator).call({ from: initiator });
        console.log('festDetails',festDetails);
        for (let id = 0; id < tickets.length; id++) {
          festData.push([festDetails[0], tickets[id], fest, '']);
        }
        return (
          <option key={fest} value={fest} >{festDetails[0]}</option>
        )
      }));

      this.setState({ fests: renderData, fest: activeFests[0], marketplace: festDetails[4], festData });
      console.log('fests', festDetails);
    } catch (err) {
      // renderNotification('danger', 'Error', 'Error while updating the festivals');
      console.log('Error while updating the fetivals', err);
    }
  }

  render() {
    return (
      <div class="container center" >
        <div class="row">
          <div class="container ">
            <div class="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>My Tickets</h5>
              <table id='requests' class="responsive-table striped" style={{marginBottom: 30}}>
                <thead>
                  <tr>
                    <th key='name' class="center">Event Name</th>
                    <th key='left' class="center">Ticket ID</th>
                    {/* <th key='price' class="center">Listing Price</th> */}
                    <th key='purchase' class="center">Actions</th>
                  </tr>
                </thead>
                <tbody class="striped highlight">
                  {this.state.festData.map((festList) => {
                    let link = "/resell"+"?eventid="+festList[2]+"&ticketid=" + festList[1]
                    return(
                    <tr>
                      <th class="center">{festList[0]}</th>
                      <th class="center">{festList[1]}</th>
                      {/* <th class="center"><input id="price" placeholder="Sale Price" type="text" className="input-control" name="price" onChange={this.inputChangedHandler} /></th> */}
                      {/* <th class="center"><button onClick={() => alert('selling!')} className="custom-btn login-btn">Resell</button></th> */}
                      <th class="center"><Link to={link}>Resell</Link></th>

                    </tr>)
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div >
    )
  }
}

export default MyTickets;