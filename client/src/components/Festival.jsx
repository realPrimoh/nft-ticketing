import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import festToken from '../proxies/FestToken';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';
import { Input, Button, Text } from '@chakra-ui/react'

let web3;
const DEFAULT_GAS = 64209;

class Festival extends Component {
  constructor() {
    super();

    this.state = {
      name: null,
      symbol: null,
      price: null,
      supply: null,
      commission: 20,
      scalp_protection: 150,
    };

    web3 = new Web3(window.ethereum);
  }

  onCreateFestival = async (e) => {
    try {
      e.preventDefault();

      const organiser = await web3.eth.getCoinbase();
      const { name, symbol, price, supply, commission, scalp_protection } = this.state;
      const { events: { Created: { returnValues: { ntfAddress, marketplaceAddress } } } } = await festivalFactory.methods.createNewFest(
        festToken._address,
        name,
        symbol,
        web3.utils.toWei(price, 'ether'),
        supply,
        commission,
        scalp_protection
      ).send({ from: organiser, gas: DEFAULT_GAS });

      renderNotification('success', 'Success', `Festival Created Successfully!`);

      const nftInstance = await FestivalNFT(ntfAddress);
      const batches = Math.ceil(supply / 30);
      let batchSupply = 30;
      let curCount = 0
      let prevCount = 0

      if (supply < 30) {
        const res = await nftInstance.methods.bulkMintTickets(supply, marketplaceAddress).send({ from: organiser, gas: DEFAULT_GAS });
      } else {
        for (let i = 0; i < batches; i++) {
          prevCount = curCount;
          curCount += 30;
          if (supply < curCount) {
            batchSupply = supply - prevCount;
          }
          const res = await nftInstance.methods.bulkMintTickets(batchSupply, marketplaceAddress).send({ from: organiser, gas: DEFAULT_GAS });
        }
      }
    } catch (err) {
      console.log('Error while creating new festival', err);
      renderNotification('danger', 'Error', `${err.message}`);
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <div class="container center" >
        <div class="row">
          <div class="container">
            <div class="container">
            <Text fontSize='4xl' padding={18}>Add New Festival</Text>
            <Text mb='8px'>Festival Name</Text>
              <Input placeholder='Festival Name' value={this.state.name} onChange={(event) => this.setState({name: event.target.value})} />

              <Text mb='8px'>Festival Ticker Symbol</Text>
              <Input placeholder='Festival Ticker Symbol' value={this.state.symbol}  onChange={(event) => this.setState({symbol: event.target.value})} />

              <Text mb='8px'>Ticket Price</Text>
              <Input placeholder='Ticket Price' value={this.state.price}  onChange={(event) => this.setState({price: event.target.value})} />

              <Text mb='8px'>Total Ticket Amount</Text>
              <Input placeholder='Total Ticket Amount' value={this.state.supply}  onChange={(event) => this.setState({supply: event.target.value})} />

              <Text mb='8px'>Commission (%)</Text>
              <Input placeholder='Commission (%)' value={this.state.commission}  onChange={(event) => this.setState({commission: event.target.value})} />

              <Text mb='8px'>Maximum Resale Price (%)</Text>
              <Input placeholder='Maximum Resale Price (%)' value={this.state.scalp_protection}  onChange={(event) => this.setState({scalp_protection: event.target.value})} />
              <Button colorScheme='teal' size='lg' marginTop={10} onClick={() => this.onCreateFestival()}>
                Add Festival
              </Button>
            </div>
          </div>
        </div>
      </div >
    )
  }
}

export default Festival;
