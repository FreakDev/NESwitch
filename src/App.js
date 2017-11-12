import React, { Component } from 'react';

import { Nes, CONTROLS } from './modules/nes'
import FontAwesome from 'react-fontawesome';


import './css/App.css';

const Button = (props) => {
  const { className, buttonDown, buttonUp, name, ...btnProps } = props;
  return (
    <div onTouchStart={ buttonDown && buttonDown.bind(this, name) } onTouchEnd={ buttonUp && buttonUp.bind(this, name) } className={ "button-wrapper " + className }>
      <div className="button" { ...btnProps }>
        { props.children }
      </div>
      {(
        props.label ? <span><br />{ props.label }</span> : null
      )}
    </div>
  )
}

const SCREEN_STATES = ['screen', 'splitted', 'gamepad']

const styles = {
  side: {
    screen: { flex: 5},
    splitted: { flex: 6},
    gamepad: { flex: 7}
  },
  center: {
    screen: { flex: 14},
    splitted: { flex: 12},
    gamepad: { flex: 10}
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.buttonDown = this.buttonDown.bind(this);
    this.buttonUp = this.buttonUp.bind(this);
    this.switchScreenState = this.switchScreenState.bind(this);

    this.state = {
      screenState: 'splitted'
    }
  }

  render() {
    return (
      <div className="App">
        <div className="col-1 left-column" style={ styles.side[this.state.screenState] }>
          <div>
            <Button buttonUp={ this.switchScreenState } name="switchScreenState">
              { this.state.screenState }
            </Button>
          </div>
          {
            ( this.state.screenState !== 'screen' ? (
              <div className="buttons direction-buttons">
                <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.UP } className="up"></Button>
                <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.RIGHT } className="right"></Button>
                <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.DOWN } className="bottom"></Button>
                <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.LEFT } className="left"></Button>
              </div>
            ) : null)
          }
        </div>
        <div className="col-1 center-col" style={ Object.assign({ display: 'flex', flexDirection: 'column' }, styles.center[this.state.screenState]) }>
          {
            ( this.state.screenState !== 'gamepad' ? <Nes style={{ flex: 5 }} rom="SMB3.nes" ref={ ref => this.nes = ref} /> : <div style={{ flex: 5 }} />)
          }
          {
            ( this.state.screenState !== 'screen' ? (
              <div style={{ flex: 1 }} className="buttons">
                <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.START } label="start"></Button>
                <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.SELECT } label="select"></Button>
              </div>  
            ) : null)
          }
        </div>
        <div className="col-1 actions-buttons" style={ styles.side[this.state.screenState] }>
          {
            ( this.state.screenState !== 'screen' ? (
              <div className="buttons-row">
                <div className="buttons">
                  <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.A } label="A"></Button>
                </div>
                <div className="buttons">
                  <Button  buttonDown={ this.buttonDown } buttonUp={ this.buttonUp } name={ CONTROLS.B } label="B"></Button>
                </div>
              </div>
            ) : null)
          }
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

  switchScreenState() {
    let nextIndex = SCREEN_STATES.indexOf(this.state.screenState) + 1
    nextIndex > (SCREEN_STATES.length - 1) && (nextIndex = 0)
    this.setState({
      screenState: SCREEN_STATES[nextIndex]
    });
  }

}

export default App;
