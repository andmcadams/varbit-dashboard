import React, {Component} from 'react';
import './VarbitListHeader.css'

class VarbitListHeader extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let toggledState = 'visible'
    if (this.props.showVarbitSelect)
      toggledState = 'ignored'
    return (
      <div class="varbit-list-header">
        <SessionInput session={this.props.session} handleSessionChange={this.props.handleSessionChange} />
        <button class="varbit-list-header-list-toggle" onClick={this.props.handleToggleVarbitList}>Show {toggledState}</button>
        <FilterList />
        <OrderList handleOrderChange={this.props.handleOrderChange} sortStyle={this.props.sortStyle} />
      </div>
    )
  }
}

class SessionInput extends Component {

  render() {
    return (
      <div class="varbit-list-header-session-input">
        <div class="session-name">Session: {this.props.session || 'No session'}</div>
        <div class="varbit-list-header-session-input-button">
          <input type="text" id="session-input" />
          <button class="varbit-list-header-session-input-button-button" onClick={() => {
            this.props.handleSessionChange(document.getElementById('session-input'))
          }}>Update session</button>
        </div>
      </div>
    )
  }
}

class FilterList extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div class="varbit-list-header-filter-list">
      </div>
    )
  }
}

class OrderList extends Component {
  
  render() {
    return (
      <div class="varbit-list-header-order-list">
        <label class="varbit-list-header-list-element" for="recent"><input type="radio" name="order" id="recent" value="recent" checked={this.props.sortStyle === "recent"} onChange={this.props.handleOrderChange} />Most recent first</label>
        <label class="varbit-list-header-list-element" for="number"><input type="radio" name="order" id="number" value="number" checked={this.props.sortStyle === "number"} onChange={this.props.handleOrderChange} />Lowest number first</label>
      </div>
    )
  }
}

export default VarbitListHeader