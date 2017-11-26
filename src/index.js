import React from 'react';
import ReactDOM from 'react-dom';

import './assets/index.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

// disable pinch to zoom (even on ios)
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});