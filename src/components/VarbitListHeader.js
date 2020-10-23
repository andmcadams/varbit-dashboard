import React, {Component} from 'react';
import './VarbitListHeader.css'

class VarbitListHeader extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    return (
      <div class="varbit-list-header">
        <p>Session: {this.props.session || 'No session'}</p>
        <input type="text" id="session-input" />
        <button onClick={() => {
          this.props.handleSessionChange(document.getElementById('session-input'))
        }}>Update session</button>
        <button onClick={this.props.handleToggleVarbitList}>I</button>
        <FilterList />
        <OrderList handleOrderChange={this.props.handleOrderChange} sortStyle={this.props.sortStyle} />
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