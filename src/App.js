import React, { Component } from 'react';

import { Nes, CONTROLS } from './modules/nes'
import Select from './Select'

import client, { MESSAGE_TYPES } from './network/client'

import './assets/App.css'

class Button extends React.Component {
  handleDown() {
    this.props.buttonDown && this.props.buttonDown(this.props.name)
  }

  handleUp() {
    this.props.buttonUp && this.props.buttonUp(this.props.name)
  }

  render() {
    const { className, buttonUp, buttonDown, ...btnProps } = this.props
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

const SCREEN_STATES = ['splitted', 'screen', 'gamepad']

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
        <div className="header">
          <div>
            <Select onChange={ this.switchScreenState } options={SCREEN_STATES} />
          </div>
        </div>
        <div className="content">
          <div className="col-1 left-column" style={ styles.side[this.state.screenState] }>
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
        <div className="overlay">          
        </div>
      </div>
    );
  }

  componentDidMount() {
    client.init()
  }

  componentDidUpdate() {
    if (this.nes)
      this.nes.fitInParent()
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

  switchScreenState(nextState) {
    if (this.state.screenState === SCREEN_STATES[0]) { // screen
      client.send(MESSAGE_TYPES.RELEASE_CODE)      
    } 

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
