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

class VarbitCheckbox extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <li>
        <div class='varbit-checkbox'>
        <input type="checkbox" checked={this.props.value} onClick={(e) => {
          this.props.handleToggleVarbit(this.props.index, e.target.checked)
        }} />
        <div class='varbit-index'>{this.props.index}</div><div class='varbit-name'>{this.props.name}</div>
        </div>
      </li>
    )
  }
}

class VarbitDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      varbits: [],
      selected: [],
      varbitMap: {},
      session: ''
    };

    this.pollVarbits = this.pollVarbits.bind(this);
    this.initVarbits = this.initVarbits.bind(this);
    this.handleToggleVarbit = this.handleToggleVarbit.bind(this);
    this.handleSessionChange = this.handleSessionChange.bind(this);
  }

  componentDidMount() {
    this.initVarbits()
  }

  initVarbits() {
    axios.get('http://localhost:3001/retrieveVarbits')
      .then((response) => {
        let varbits = {}
        response.data.arr.forEach(varbit => {
          varbits[varbit.index] = varbit
        })
        this.setState({
          varbits: response.data.arr,
          varbitMap: varbits
        });
        setInterval( () => {
          this.pollVarbits();
        }, 600);
      })
      .catch((error) => {
        console.log('Error: ' + error)
        this.setState({
          error: error
        })
      })
  }

  pollVarbits() {
    axios.get('http://localhost:3001/retrieveQueue')
      .then((response) => {
        let newMap = Object.assign({}, this.state.varbitMap)
        let newState = response.data.arr

        if (newState.length !== 0)
        {
          console.log('update')
          response.data.arr.forEach(element => {
            newMap[element.index] = element;
          })
          let oldFilteredState = this.state.varbits.filter(function(value, index, arr){ 
            for (let i = 0; i < response.data.arr.length; i++)
              if(response.data.arr[i].index === value.index)
                return false;
            return true;
          })
          newState.push(...oldFilteredState)
          this.setState({
            varbits: newState,
            varbitMap: newMap
          })
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

  handleSessionChange(e) {
    console.log('New session string: ' + e.target.value)
    this.setState({
      session: e.target.value
    })
  }

  render() {
    return (
      <div class="container">
      <VarbitList varbits={this.state.varbits} handleToggleVarbit={this.handleToggleVarbit} selected={this.state.selected} session={this.state.session} handleSessionChange={this.handleSessionChange} />
      <VarbitTimelineContainer selected={this.state.selected} varbits={this.state.varbitMap} handleToggleVarbit={this.handleToggleVarbit} session={this.state.session} />
      </div>
    )
  }
}

class VarbitList extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div class='varbitScrollBoxContainer'>
      <input type="text" value={this.props.session} onChange={this.props.handleSessionChange} />
      <div class='varbitScrollBox'>
      <ul>
      {this.props.varbits.map((varbit) => {
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

class VarbitTimelineContainer extends Component {
  
  constructor(props) {
    super(props)
  }

  render() {
    let ticks = {}
    // Get a list of all ticks needed.
    // Make it an object to avoid dupes
    this.props.selected.forEach((selectedVarb) => {
      let varb = this.props.varbits[selectedVarb];
      if (varb.updates != null)
        varb.updates.forEach((update) => {
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
          <VarbitTimelineHeader varbit={this.props.varbits[varbitIndex]} handleToggleVarbit={this.props.handleToggleVarbit} />
          <VarbitTimelineBody varbit={this.props.varbits[varbitIndex]} ticks={ticks} session={this.props.session} />
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

    return (
      <div class='timeline-header'>
        <div class='timeline-header-name'>{this.props.varbit.name || 'Varbit ' + this.props.varbit.index}</div>
        <div class='timeline-header-button-moreinfo'><button>More info</button></div>
        <div class='timeline-header-button-addinfo'><button>Add info</button></div>
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
    console.log('updated')
    if (this.flag)
    {
      console.log(this.refs.b.scrollLeft)
      console.log(this.refs.b.scrollWidth)
      console.log(this.refs.b.clientWidth)
      this.refs.b.scrollLeft = this.refs.b.scrollWidth;
      this.flag = false
    }
  }

  render() {
    let ticks = {};
    // For each update, add the update to the right tick
    this.props.varbit.updates.forEach((update, index) => {
      if (update.session === this.props.session)
      {
        if (ticks[update.tick] == null)
          ticks[update.tick] = [update];
        else
          ticks[update.tick].push(update)
      }
    })
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
