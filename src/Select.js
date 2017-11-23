import React from 'react'
import PropTypes from 'prop-types'

import './assets/Select.css'

export default class Select extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            value: props.options[0],
            open: false
        }

        this.clickOption = this.clickOption.bind(this)
        this.toggleDropdown = this.toggleDropdown.bind(this)
    }

    static propTypes = {
        options: PropTypes.array.isRequired
    }

    clickOption(value) {
        this.setState({ value });
        this.toggleDropdown(false);
        this.props.onChange && this.props.onChange(value)
    }

    toggleDropdown(open) {
        if (typeof open !== 'boolean') {
            open = !this.state.open
        }

        this.setState({ open })
    }

    render() {
        return (
            <div className="select-wrapper">
                <span className="selected" onClick={ this.toggleDropdown }>
                    <div style={{ borderColor: this.props.arrowColor || "#000" }} className={ 'arrow ' + (this.state.open ? 'down' : 'right') }></div> { this.state.value.label || this.state.value }
                </span>
                <div className={ 'dropdown' + (this.state.open ? ' open' : '') }>
                    <ul>
                        { this.props.options.map((opt, k) => (
                            <li key={k} onClick={ this.clickOption.bind(this, opt)}>{ opt.label || opt }</li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
}