import React, { Component } from 'react';

import { Nes, CONTROLS } from './modules/nes'


import './css/App.css';

const Button = (props) => {
  const { className, buttonDown, buttonUp, ...btnProps } = props;
  return (
    <div onTouchStart={ buttonDown.bind(this, props.name) } onTouchEnd={ buttonUp.bind(this, props.name) } className={ "button-wrapper " + className }>
      <div className="button" { ...btnProps } />
      {(
        props.label ? <span><br />{ props.label }</span> : null
      )}
    </div>
  )
}


class App extends Component {
  constructor(props) {
    super(props);

    this.buttonDown = this.buttonDown.bind(this);
    this.buttonUp = this.buttonUp.bind(this);
  }

  render() {
    return (
      <div className="App">
        <div className="col-1 direction-buttons" style={{ flex:6 }}>
          <div className="buttons">
            <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.UP } className="up"></Button>
            <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.RIGHT } className="right"></Button>
            <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.DOWN } className="bottom"></Button>
            <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.LEFT } className="left"></Button>
          </div>
        </div>
        <div className="col-1 center-col" style={{ flex:12, display: 'flex', flexDirection: 'column' }}>
          <Nes style={{ flex: 5 }} rom="SMB3.nes" ref={ ref => this.nes = ref} />
          <div style={{ flex: 1 }} className="buttons">
            <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.START } label="start"></Button>
            <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.SELECT } label="select"></Button>
          </div>
        </div>
        <div className="col-1 actions-buttons" style={{ flex:6 }}>
          <div className="buttons-row">
            <div className="buttons">
              <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.A } label="A"></Button>
            </div>
            <div className="buttons">
              <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.B } label="B"></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  buttonDown(button) {
    this.nes.buttonDown(1, button)
  }

  buttonUp(button) {
    this.nes.buttonUp(1, button)
  }

  }
}

export default App;
