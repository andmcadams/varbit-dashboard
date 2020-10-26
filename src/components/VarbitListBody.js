import React, {Component} from 'react';
import './VarbitListBody.css';

class VarbitListBody extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ignoredVarbits: []
    }

    this.handleRemoveFromIgnore = this.handleRemoveFromIgnore.bind(this);
    this.handleAddToIgnore = this.handleAddToIgnore.bind(this);
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

  handleAddToIgnore(index) {
    let newIgnoredVarbits = [...this.state.ignoredVarbits];
    newIgnoredVarbits.push(index);
    console.log(newIgnoredVarbits)
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
    if(this.props.sortStyle === "recent")
      orderedVarbitList = this.getOrderedVarbitMap(this.props.varbitUpdatesMap);
    else
      orderedVarbitList = Object.keys(this.props.varbitUpdatesMap)

    let isIgnoreList = !this.props.showVarbitSelect
    let varbitList = <VarbitList {...this.props} isIgnoreList={isIgnoreList} ignoredVarbits={this.state.ignoredVarbits} handleRemoveFromIgnore={this.handleRemoveFromIgnore} handleAddToIgnore={this.handleAddToIgnore} orderList={orderedVarbitList} />

    return varbitList
  }
}

class VarbitList extends Component {

  render() {
    let listClass = this.props.isIgnoreList ? 'varbit-ignore-list' : 'varbit-select-list';
    listClass += ' varbit-list-body'
    return ( 
      <div class={listClass}>
        <ul>
          {
            this.props.orderList.map((varbitIndex) => {
              
              varbitIndex = parseInt(varbitIndex);
              let value = this.props.selected.includes(varbitIndex);
              let handleIgnoreOption = this.props.isIgnoreList ? this.props.handleRemoveFromIgnore : this.props.handleAddToIgnore;
              let buttonText = this.props.isIgnoreList ? 'X' : 'Hide';

              if (this.props.ignoredVarbits.includes(varbitIndex) === this.props.isIgnoreList)
              {
                let varbit = this.props.varbitMap[varbitIndex];
                return <VarbitListElement varbit={varbit} value={value} handleToggleVarbit={this.props.handleToggleVarbit} handleIgnoreOption={handleIgnoreOption} buttonText={buttonText} />;
              }
              else
                return null;
            })
          }
        </ul>
      </div>
    )
  }
}

class VarbitListElement extends Component {

  render() {
    let varbit = this.props.varbit;
    return (
      <li>
        <div class='varbit-list-element'>
          <input type="checkbox" checked={this.props.value} class='varbit-list-element-checkbox' onChange={(e) => {
            this.props.handleToggleVarbit(varbit.index, e.target.checked)
          }} />
          <div class='varbit-index'>{varbit.index}</div><div class='varbit-name'>{varbit.name}</div>
          <div class="varbit-button-div">
            <button class='varbit-button' onClick={(e) => {
              this.props.handleIgnoreOption(varbit.index)}}>{this.props.buttonText}</button>
          </div>          
        </div>
      </li>
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
        <div class='varbit-list-element'>
          <input type="checkbox" checked={this.props.value} class='varbit-list-element-checkbox' onChange={(e) => {
            this.props.handleToggleVarbit(this.props.index, e.target.checked)
          }} />
          <div class='varbit-index'>{this.props.index}</div>
          <div class='varbit-name'>{this.props.name}</div>
          <div class='varbit-button-div'>
            <button class='varbit-button' onClick={(e) => {
            this.props.handleAddToIgnore(this.props.index)}}>Hide</button>
          </div>
        </div>
      </li>
    )
  }
}

export default VarbitListBody