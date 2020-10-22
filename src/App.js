import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';


function App() {
  console.log('App')
  return (
    <VarbitDashboard />
  );
}

class VarbitDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      varbitMap: {},
      varbitUpdatesMap: {},
      selected: [],
      ignoredVarbits: [],
      session: '',
      lastTick: -1
    };

    this.checkVarbits = this.checkVarbits.bind(this);
    this.checkVarbitUpdates = this.checkVarbitUpdates.bind(this);
    this.handleToggleVarbit = this.handleToggleVarbit.bind(this);
    this.handleMoveVarbit = this.handleMoveVarbit.bind(this);
    this.handleSessionChange = this.handleSessionChange.bind(this);
    this.handleRemoveFromIgnore = this.handleRemoveFromIgnore.bind(this);
  }

  componentDidMount() {
    setInterval(() => {
      this.checkVarbitUpdates()
    }, 600)
  }

  // Given a list of varbits, retrieve them from the backend.
  checkVarbits(varbitsToCheck, newVarbitUpdatesMap, newLastTick) {
    axios.post('http://localhost:3001/retrieveVarbits', {
      requestedVarbits: varbitsToCheck,
    }).then((response) => {

      let varbits = response.data.arr;
      let newMap = Object.assign({}, this.state.varbitMap)

      // Is it okay to mutate state and then assign it?
      varbits.forEach(varbit => {
        newMap[varbit.index] = varbit
      });
      console.log('Setting varbitMap')
      console.log(newMap)
      this.setState({
        varbitMap: newMap,
        varbitUpdatesMap: newVarbitUpdatesMap,
        lastTick: newLastTick
      })
    })
  }

  // Get any new varbit updates for the current session.
  checkVarbitUpdates() {
    axios.post('http://localhost:3001/retrieveVarbitUpdates', {
      session: this.state.session,
      lastTick: this.state.lastTick
    }).then((response) => {
        let updates = response.data.arr
        if (updates != null && updates.length !== 0)
        {
          let newLastTick = -1;
          let varbitsToCheck = []
          let newVarbitUpdatesMap = Object.assign({}, this.state.varbitUpdatesMap)
          updates.forEach(update => {
            if (newVarbitUpdatesMap[update.index] == null)
            {
              newVarbitUpdatesMap[update.index] = [];
              varbitsToCheck.push(update.index)
            }
            newVarbitUpdatesMap[update.index].push(update);
            if (update.tick > newLastTick)
              newLastTick = update.tick
          })
          this.checkVarbits(varbitsToCheck, newVarbitUpdatesMap, newLastTick);
        }
      })
      .catch((error) => {
        console.log('Error: ' + error)
        this.setState({
          error: error
        })
      })
  }

  handleToggleVarbit(value, isChecked) {
    let newSelected = [...this.state.selected]
    if (isChecked){
      newSelected.push(value)
    }
    else {
      let pos = newSelected.indexOf(value);
      if (pos != -1)
        newSelected.splice(pos, 1);
    }
    this.setState({
      selected: newSelected
    })
  }

  handleMoveVarbit(direction, index) {
    let newSelected = [...this.state.selected];
    let i = newSelected.indexOf(index);
    let newPosition = i + direction
    // If the item is selected, move it one in the direction given
    if (i != -1 && newPosition < newSelected.length && newPosition >= 0) {
      let temp = newSelected[i+direction];
      newSelected[i+direction] = index;
      newSelected[i] = temp;
      this.setState({
        selected: newSelected
      })
    }
  }

  handleSessionChange(e) {
    this.setState({
      varbitMap: {},
      varbitUpdatesMap: {},
      selected: [],
      ignoredVarbits: [],
      session: e.target.value,
      lastTick: -1
    })
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

  render() {
    console.log('Dashboard render')
    console.log(this.state.varbitMap)
    return (
      <div class="container">
      <VarbitListPanel {...this.state} handleToggleVarbit={this.handleToggleVarbit} handleSessionChange={this.handleSessionChange} handleRemoveFromIgnore={this.handleRemoveFromIgnore} />
      <VarbitTimelineContainer {...this.state} handleToggleVarbit={this.handleToggleVarbit} handleMoveVarbit={this.handleMoveVarbit} />
      </div>
    )
  }
}

class VarbitListPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showVarbitSelect: true,
      sortByRecent: true
    };

    this.handleToggleVarbitList = this.handleToggleVarbitList.bind(this);
    this.handleToggleSortByRecent = this.handleToggleSortByRecent.bind(this);
  }

  handleToggleVarbitList() {
    this.setState({
      showVarbitSelect: !this.state.showVarbitSelect
    });
  }

  handleToggleSortByRecent() {
    this.setState({
      sortByRecent: !this.state.sortByRecent
    })
  }

  render() {
    let varbitList = <VarbitList {...this.props} showVarbitSelect={this.state.showVarbitSelect} sortByRecent={this.state.sortByRecent} />

    return (
      <div class='varbit-list-panel'>
        <button onClick={this.handleToggleVarbitList}>I</button>
        {varbitList}
      </div>
    )
  }
}

class VarbitList extends Component {
  constructor(props) {
    super(props)
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
      return <VarbitSelectList {...this.props} orderList={orderedVarbitList} />
    else
      return <VarbitIgnoreList {...this.props} orderList={orderedVarbitList} />
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

class VarbitTimelineContainer extends Component {
  
  constructor(props) {
    super(props)
  }

  render() {
    let ticks = {}
    // Get a list of all ticks needed.
    // Make it an object to avoid dupes
    this.props.selected.forEach((selectedVarb) => {
      let updates = this.props.varbitUpdatesMap[selectedVarb];
      updates.forEach((update) => {
        if (update.session === this.props.session)
          ticks[update.tick] = 1;
      })
    })
    ticks = Object.keys(ticks);
    return (
      <ScrollSync>
      <div class='timeline-container'>
      {this.props.selected.map((varbitIndex) => {
        return (
          <div class='timeline'>
          <VarbitTimelineHeader varbit={this.props.varbitMap[varbitIndex]} handleToggleVarbit={this.props.handleToggleVarbit} handleMoveVarbit={this.props.handleMoveVarbit}/>
          <VarbitTimelineBody updates={this.props.varbitUpdatesMap[varbitIndex]} ticks={ticks} session={this.props.session} />
          </div>
          )
        })
      }
      </div>
      </ScrollSync>
    )
  }
}

class VarbitTimelineHeader extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    let onClickMoveFunctor = (direction) => {
      return () => {
        this.props.handleMoveVarbit(direction, this.props.varbit.index)
      }
    }
    return (
      <div class='timeline-header'>
        <div class='timeline-header-name'>{this.props.varbit.name || 'Varbit ' + this.props.varbit.index}</div>
        <div class='timeline-header-button-moreinfo'><button>More info</button></div>
        <div class='timeline-header-button-addinfo'><button>Add info</button></div>
        <div class='timeline-header-button-moveup'><button onClick={onClickMoveFunctor(-1)}>Up</button></div>
        <div class='timeline-header-button-movedown'><button onClick={onClickMoveFunctor(1)}>Down</button></div>
        <div class='timeline-header-button-removevarbit'><button onClick={(e) => {
          this.props.handleToggleVarbit(this.props.varbit.index, false)
        }}>X</button></div>
      </div>
    )
  }
}

class VarbitTimelineBody extends Component {

  constructor(props) {
    super(props)
    this.flag = true
  }

  componentDidMount() {
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    if (this.flag)
    {
      this.refs.b.scrollLeft = this.refs.b.scrollWidth;
      this.flag = false
    }
  }

  getTicksWithUpdates(props) {
    let ticks = {};
    // For each update, add the update to the right tick
    Object.values(props.updates).forEach((update, index) => {
      if (update.session === props.session)
      {
        if (ticks[update.tick] == null)
          ticks[update.tick] = [update];
        else
          ticks[update.tick].push(update)
      }
    })

    return ticks;
  }

  render() {
    let ticks = this.getTicksWithUpdates(this.props);
    let lastGoodValue = null;
    let cells = this.props.ticks.map((tick) => {
      if (ticks[tick] != null)
        lastGoodValue = ticks[tick][ticks[tick].length-1].newValue;
      return <VarbitTimelineBodyCell tick={tick} updates={ticks[tick] || [{newValue: lastGoodValue}]} />
    })

    // This definitely needs to be rewritten.
    // If the scroll bar is all the way to the right (or does not exist),
    // we need to make the flag true.
    // Effectively create a right-sticky scrollbar.
    if(this.refs.b != null)
    {
      if ((this.refs.b.scrollLeft + this.refs.b.clientWidth) === this.refs.b.scrollWidth)
      {
        this.flag = true;
      }
      else
        this.flag = false;
    }
    else
      this.flag = false;

    return (
      <ScrollSyncPane>
      <div class='timeline-body' ref='b'>
        {cells}
      </div>
      </ScrollSyncPane>
    )
  }
}

class VarbitTimelineBodyCell extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    // Create a cell with the 
    let lastIndex = this.props.updates.length-1;
    let newValue = this.props.updates[lastIndex].newValue;
    let oldValue = this.props.updates[lastIndex].oldValue;

    let cellDiv = null;

    // If the varbit value is unknown, only add tick.
    if (newValue == null && oldValue == null)
      cellDiv = <div class='timeline-body-cell timeline-body-cell-unknown'>T: {this.props.tick}</div>
    else if (newValue != null && oldValue == null)
      cellDiv = <div class='timeline-body-cell timeline-body-cell-unchanged'><p>{newValue}</p><p>T: {this.props.tick}</p></div>
    else if (newValue != null && oldValue != null)
      cellDiv = <div class='timeline-body-cell timeline-body-cell-changed'><p>{oldValue} → {newValue}</p><p>T: {this.props.tick}</p></div>

    return cellDiv
  }
}

export default App;
