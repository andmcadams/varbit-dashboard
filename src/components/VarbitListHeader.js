import React, {Component} from 'react';

class VarbitListHeader extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    return (
      <div class='varbit-list-header'>
        <p>Session: {this.props.session || 'No session'}</p>
        <input type="text" id="session-input" />
        <button onClick={() => {
          this.props.handleSessionChange(document.getElementById('session-input'))
        }}>Update session</button>
      </div>
    )
  }
}

export default VarbitListHeader