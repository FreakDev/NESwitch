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
    this.disconnectGamePad = this.disconnectGamePad.bind(this)

    this.state = {
      screenState: 'splitted',
      instanceCode: '',
      playerPos: 0,
      error: '',
    }
  }

  render() {
    return (
      <div className="App">
        <div className="col-1 left-column" style={ styles.side[this.state.screenState] }>
          <div className="header">
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
          <div className="settings">
            Select a mode<br />
            <Select arrowColor="#878787" onChange={ this.switchScreenState } options={SCREEN_STATES} />        
            {
              ( this.state.screenState === SCREEN_STATES[1] ? ( // screen
                <div>
                  <br />                  
                  { this.state.instanceCode }
                </div> ) : null
              )
            }
            {
              ( this.state.screenState === SCREEN_STATES[2] ? ( // gamepad
                  this.state.playerPos === 0 ? (
                    <div>
                      <br />
                      Enter screen code : <br />
                      <input type="text" value={ this.state.instanceCode } onChange={(e) => this.setState({ instanceCode : e.target.value })}/><br />
                      <button onClick={ this.connectGamePad }>Connect</button>
                    </div> ) 
                  : (
                    <div>
                        Connected as player { this.state.playerPos }<br />
                        <button onClick={ this.disconnectGamePad }>Disconnect</button>
                    </div> 
                  )
                ) : null
              )
            }
          </div>
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
        <div className="overlay"></div>
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
    if (this.state.screenState === SCREEN_STATES[0]) {
      this.nes.buttonDown(1, button)
    } else {
      client.send(MESSAGE_TYPES.BUTTON, { button, pressed:true })
    }
  }

  buttonUp(button) {
    if (this.state.screenState === SCREEN_STATES[0]) {      
      this.nes.buttonUp(1, button)
    } else {
      client.send(MESSAGE_TYPES.BUTTON, { button, pressed:false })
    }
  }

  connectGamePad() {
    client.addListener(MESSAGE_TYPES.CONNECT, (status) => {
      client.removeListener(MESSAGE_TYPES.CONNECT)

      client.addListener(MESSAGE_TYPES.DISCONNECT, () => {
        client.removeListener(MESSAGE_TYPES.DISCONNECT)
        this.setState({
          playerPos: 0,
          instanceCode: ''
        })
      })

      if (status.success) {
        this.setState({
          playerPos: status.playerPos
        });  
      } else {
        this.setState({
          error: status.error
        });          
      }
    });
    client.send(MESSAGE_TYPES.CONNECT, { code: this.state.instanceCode })
  }

  disconnectGamePad() {
    client.send(MESSAGE_TYPES.DISCONNECT, { code: this.state.instanceCode })    
    this.setState({
      playerPos: 0
    })
  }

  switchRom(rom) {
    if (rom.value !== this.state.rom)
      this.setState({
        rom: rom.value
      })
  }

  switchScreenState(nextState) {
    if (this.state.screenState === SCREEN_STATES[1]) { // screen
      client.send(MESSAGE_TYPES.RELEASE_CODE)
    } else if(this.state.screenState === SCREEN_STATES[2]) { // gamepad
      this.disconnectGamePad()
    }

    this.setState({
      screenState: nextState,
      instanceCode: ''
    });

    if (nextState === SCREEN_STATES[1]) { // screen
        client.addListener(MESSAGE_TYPES.SET_CODE, (data) => {
          this.setState({
            instanceCode: data.code
          })
          client.removeListener(MESSAGE_TYPES.SET_CODE)
          client.addListener(MESSAGE_TYPES.BUTTON, (data) => {
            this.nes['button' + (data.pressed ? 'Down' : 'Up')](data.player, data.button)
          })
        })
        client.send(MESSAGE_TYPES.GET_CODE)
    } else {
      client.removeListener(MESSAGE_TYPES.SET_CODE)
    }
  }

}

export default App;
