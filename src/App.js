import React, { Component } from 'react';

import { Nes, CONTROLS } from './modules/nes'

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Nes rom="SMB3.nes" ref={ ref => this.nes = ref} />
      </div>
    );
  }

}

export default App;
