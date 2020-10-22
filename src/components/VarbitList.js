import React, {Component} from 'react';
import './VarbitList.css';

class VarbitList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ignoredVarbits: []
    }

    this.handleRemoveFromIgnore = this.handleRemoveFromIgnore.bind(this);
  }

  handleRemoveFromIgnore(index) {
    let newIgnoredVarbits = [...this.state.ignoredVarbits];
    let i = newIgnoredVarbits.indexOf(index);
    if (i != -1)
      newIgnoredVarbits.splice(i, 1)
    this.setState({
      ignoredVarbits: newIgnoredVarbits
    })
  }

  getOrderedVarbitMap(varbitUpdatesMap) {
    let updates = varbitUpdatesMap;
    let orderList = [];
    Object.keys(updates).forEach((index) => {
      orderList.push([index, updates[index][updates[index].length-1].tick])
    });

    orderList.sort((indexTickTuple1, indexTickTuple2) => {
      return indexTickTuple2[1] - indexTickTuple1[1];
    })

    orderList = orderList.map((e) => {
      return e[0]
    })

    return orderList;
  }

  render() {
    let orderedVarbitList = null
    if(this.props.sortByRecent)
      orderedVarbitList = this.getOrderedVarbitMap(this.props.varbitUpdatesMap);
    else
      orderedVarbitList = Object.keys(this.props.varbitUpdatesMap)

    if (this.props.showVarbitSelect)
      return <VarbitSelectList {...this.props} ignoredVarbits={this.state.ignoredVarbits} orderList={orderedVarbitList} />
    else
      return <VarbitIgnoreList {...this.props} ignoredVarbits={this.state.ignoredVarbits} handleRemoveFromIgnore={this.handleRemoveFromIgnore} orderList={orderedVarbitList} />
  }
}

class VarbitIgnoreList extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div class='varbit-ignore-list varbitScrollBox'>
      <ul>
      {this.props.orderList.map((varbitIndex) => {
        if (!this.props.ignoredVarbits.includes(varbitIndex))
          return null;
        let varbit = this.props.varbitMap[varbitIndex]
        let name = varbit.name || ''
        return <VarbitIgnoreListElement handleToggleVarbit={this.props.handleRemoveFromIgnore} key={varbit.index} name={name} index={varbit.index} />
      })}
      </ul>
      </div>
    )
  }
}

class VarbitIgnoreListElement extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <li>
        <div class='varbit-ignore-list-element'>
          <div class='varbit-index'>{this.props.index}</div><div class='varbit-name'>{this.props.name}</div>
          <button class='varbit-ignore-list-element-remove-button' onClick={(e) => {
            this.props.handleRemoveFromIgnore(this.props.index)}}>X</button>
        </div>
      </li>
    )
  }
}

class VarbitSelectList extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div class='varbitScrollBoxContainer'>
      <label for="session-input">Session</label>
      <input type="text" id="session-input" value={this.props.session} onChange={this.props.handleSessionChange} />
      <div class='varbitScrollBox'>
      <ul>
      {this.props.orderList.map((varbitIndex) => {
        console.log(varbitIndex)
        if(this.props.ignoredVarbits.includes(varbitIndex))
          return null;
        let varbit = this.props.varbitMap[varbitIndex]
        console.log(this.props.varbitMap)
        let name = varbit.name || ''
        let isSelected = this.props.selected.includes(varbit.index)
        return <VarbitCheckbox handleToggleVarbit={this.props.handleToggleVarbit} key={varbit.index} name={name} index={varbit.index} value={isSelected} />
      })}
      </ul>
      </div>
      </div>
    )
  }
}

class VarbitCheckbox extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <li>
        <div class='varbit-checkbox'>
        <input type="checkbox" checked={this.props.value} onChange={(e) => {
          this.props.handleToggleVarbit(this.props.index, e.target.checked)
        }} />
        <div class='varbit-index'>{this.props.index}</div><div class='varbit-name'>{this.props.name}</div>
        </div>
      </li>
    )
  }
}

export default VarbitList