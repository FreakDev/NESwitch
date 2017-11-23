/**
 * Credits goes to Ben Firshman
 * https://github.com/bfirsh/jsnes-web
 */

import React, { Component } from "react";
import FrameTimer from "../libs/FrameTimer";
import Speakers from "../libs/Speakers";
import { NES, Controller } from "jsnes";

import './assets/nes.css' 

const BASE_ROM_URL = 'roms/'

export const CONTROLS = {
  A: Controller.BUTTON_A,
  B: Controller.BUTTON_B,
  SELECT: Controller.BUTTON_SELECT,
  START: Controller.BUTTON_START,
  UP: Controller.BUTTON_UP,
  DOWN: Controller.BUTTON_DOWN,
  LEFT: Controller.BUTTON_LEFT,
  RIGHT: Controller.BUTTON_RIGHT,
}

function loadBinary(path, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", path);
  req.overrideMimeType("text/plain; charset=x-user-defined");
  req.onload = function() {
    if (this.status === 200) {
      callback(null, this.responseText);
    } else {
      callback(new Error(req.statusText));
    }
  };
  req.onerror = function() {
    callback(new Error(req.statusText));
  };
  req.send();
}

class Nes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      paused: false
    };
  }

  render() {
    return (
        <div ref={ ref => this.screenContainer = ref} style={ this.props.style } className="screen-container">
            <canvas
                className="Screen"
                width="256"
                height="240"
                onMouseDown={this.handleMouseDown}
                onMouseUp={() => {
                    // console.log("mouseUp")
                    this.nes.zapperFireUp();
                }}
                ref={canvas => {
                this.canvas = canvas;
                }}
                style={{ width: 0 }}
            />
        </div>
    );
  }

  componentDidMount() {

    this.initCanvas();

    this.speakers = new Speakers({
      onBufferUnderrun: (actualSize, desiredSize) => {
        if (!this.state.running || this.state.paused) {
          return;
        }
        console.log(
          "Buffer underrun, running another frame to try and catch up"
        );
        this.nes.frame();

        if (this.speakers.buffer.size() < desiredSize) {
          console.log("Still buffer underrun, running a second frame");
          this.nes.frame();
        }
      }
    });
    this.nes = new NES({
      onFrame: this.setBuffer,
      onStatusUpdate: console.log,
      // onAudioSample: this.speakers.writeSample
    });

    this.frameTimer = new FrameTimer({
      onGenerateFrame: this.nes.frame,
      onWriteFrame: this.writeBuffer
    });

    // document.addEventListener("keydown", this.keyboardController.handleKeyDown);
    // document.addEventListener("keyup", this.keyboardController.handleKeyUp);
    // document.addEventListener(
    //   "keypress",
    //   this.keyboardController.handleKeyPress
    // );

    window.addEventListener("resize", this.layout);
    this.layout()

    if (this.props.rom)
        this.load(this.props.rom)
  }

  componentWillUpdate(nextProps) {
    if (nextProps.rom !== this.props.rom) {
      this.stop()
      this.load(nextProps.rom);
    }
  }

  componentWillUnmount() {
    this.stop()
    // document.removeEventListener(
    //   "keydown",
    //   this.keyboardController.handleKeyDown
    // );
    // document.removeEventListener("keyup", this.keyboardController.handleKeyUp);
    // document.removeEventListener(
    //   "keypress",
    //   this.keyboardController.handleKeyPress
    // );
    window.removeEventListener("resize", this.layout);
  }

  load = (rom) => {
    if (rom) {
      const path = BASE_ROM_URL + rom;
      loadBinary(path, (err, data) => {
        if (err) {
          window.alert(`Error loading ROM: ${err.toString()}`);
        } else {
          this.handleLoaded(data);
        }
      });
    } else {
      window.alert("No ROM provided");
    }
  };

  handleLoaded = data => {
    this.setState({ running: true });
    this.nes.loadROM(data);
    this.start();
  };

  start = () => {
    this.frameTimer.start();
    this.speakers.start();
  };

  stop = () => {
    this.frameTimer.stop();
    this.speakers.stop();
  };

  handlePauseResume = () => {
    if (this.state.paused) {
      this.setState({ paused: false });
      this.start();
    } else {
      this.setState({ paused: true });
      this.stop();
    }
  };

  layout = () => {
    let navbarHeight;
    this.screenContainer.style.height = `${window.innerHeight -
      navbarHeight}px`;
    this.fitInParent();
  };

  initCanvas() {
    this.context = this.canvas.getContext("2d");
    this.imageData = this.context.getImageData(0, 0, 256, 240);

    this.context.fillStyle = "black";
    // set alpha to opaque
    this.context.fillRect(0, 0, 256, 240);

    // buffer to write on next animation frame
    this.buf = new ArrayBuffer(this.imageData.data.length);
    // Get the canvas buffer in 8bit and 32bit
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    // Set alpha
    for (var i = 0; i < this.buf32.length; ++i) {
      this.buf32[i] = 0xff000000;
    }
  }

  setBuffer = buffer => {
    var i = 0;
    for (var y = 0; y < 240; ++y) {
      for (var x = 0; x < 256; ++x) {
        i = y * 256 + x;
        // Convert pixel from NES BGR to canvas ABGR
        this.buf32[i] = 0xff000000 | buffer[i]; // Full alpha
      }
    }
  };

  writeBuffer = () => {
    this.imageData.data.set(this.buf8);
    this.context.putImageData(this.imageData, 0, 0);
  };

  fitInParent = () => {
    let parent = this.canvas.parentNode;
    let parentWidth = parent.clientWidth;
    let parentHeight = parent.clientHeight;
    let parentRatio = parentWidth / parentHeight;
    let desiredRatio = 256 / 240;
    if (desiredRatio < parentRatio) {
      this.canvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
      this.canvas.style.height = `${parentHeight}px`;
    } else {
      this.canvas.style.width = `${parentWidth}px`;
      this.canvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
    }
  };

  screenshot() {
    var img = new Image();
    img.src = this.canvas.toDataURL("image/png");
    return img;
  }

  handleMouseDown = (e) => {
    if (!this.props.onMouseDown) return;
    // Make coordinates unscaled
    let scale = 256 / parseFloat(this.canvas.style.width);
    let rect = this.canvas.getBoundingClientRect();
    let x = Math.round((e.clientX - rect.left) * scale);
    let y = Math.round((e.clientY - rect.top) * scale);

    this.nes.zapperMove(x, y);
    this.nes.zapperFireDown();
  };

  buttonDown(player, button) {
    this.nes.buttonDown(player, button)    
  }

  buttonUp(player, button) {
    this.nes.buttonUp(player, button)    
  }

}

export default Nes;