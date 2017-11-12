import React, { Component } from 'react';

import { Nes, CONTROLS } from './modules/nes'

import client, { MESSAGE_TYPES } from './network/client'

import './css/App.css'

class Button extends React.Component {
  handleDown() {
    this.props.buttonDown && this.props.buttonDown(this.props.name)
  }

  handleUp() {
    this.props.buttonUp && this.props.buttonUp(this.props.name)
  }

  render() {
    const { className, ...btnProps } = this.props
    return (
      <div onMouseDown={ this.handleDown.bind(this) } 
           onMouseUp={ this.handleUp.bind(this) } 
           onTouchStart={ this.handleDown.bind(this) } 
           onTouchEnd={ this.handleUp.bind(this) } className={ "button-wrapper " + className }>
        <div className="button" { ...btnProps }>
          { this.props.children }
        </div>
        {(
          this.props.label ? <span><br />{ this.props.label }</span> : null
        )}
      </div>
    )
  }
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

    this.buttonDown = this.buttonDown.bind(this)
    this.buttonUp = this.buttonUp.bind(this)
    this.switchScreenState = this.switchScreenState.bind(this)
    this.connectGamePad = this.connectGamePad.bind(this)

    this.state = {
      screenState: 'splitted',
      instanceCode: ''
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
            ( this.state.screenState === SCREEN_STATES[0] ? (
              <div>
                { this.state.instanceCode }
              </div> ) : null
            )
          }
          {
            ( this.state.screenState === SCREEN_STATES[2] ? (
              <div>
                <input type="text" value={ this.state.instanceCode } onChange={(e) => this.setState({ instanceCode : e.target.value })}/><button onClick={ this.connectGamePad }>Connect</button>
              </div> ) : null
            )
          }
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

  componentDidMount() {
    client.init()
  }

  buttonDown(button) {
    if (this.state.screenState === SCREEN_STATES[1]) {
      this.nes.buttonDown(1, button)
    } else {
      client.send(MESSAGE_TYPES.BUTTON, { button, pressed:true })
    }
  }

  buttonUp(button) {
    if (this.state.screenState === SCREEN_STATES[1]) {      
      this.nes.buttonUp(1, button)
    } else {
      client.send(MESSAGE_TYPES.BUTTON, { button, pressed:false })
    }
  }

  connectGamePad() {
    client.send(MESSAGE_TYPES.CONNECT, { code: this.state.instanceCode })
  }

  switchScreenState() {
    let nextIndex = SCREEN_STATES.indexOf(this.state.screenState) + 1
    nextIndex > (SCREEN_STATES.length - 1) && (nextIndex = 0)

    let nextState = SCREEN_STATES[nextIndex]

    this.setState({
      screenState: nextState,
      instanceCode: ''
    });

    if (nextState === SCREEN_STATES[0]) { // screen
        client.addListener(MESSAGE_TYPES.SET_CODE, (data) => {
          this.setState({
            instanceCode: data.code
          })
          client.removeListener(MESSAGE_TYPES.SET_CODE)
          client.addListener(MESSAGE_TYPES.BUTTON, (data) => {
            this.nes['button' + (data.pressed ? 'Down' : 'Up')](1, data.button)
          })
        })
        client.send(MESSAGE_TYPES.GET_CODE)
    } else {
      client.removeListener(MESSAGE_TYPES.SET_CODE)
    }
  }

}

export default App;
