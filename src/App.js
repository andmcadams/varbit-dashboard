import React, {Component} from 'react';
import './App.css';
import axios from 'axios';


function App() {
  console.log('App')
  return (
    <VarbitDashboard />
  );
}

class VarbitCheckbox extends Component {

  constructor(props) {
    super(props)
    this.state = {
      checked: false
    };
  }

  toggleVarbit = () => {
    this.setState({checked: !this.state.checked})
  }

  render() {
    return (
      <li>
        <div class='varbit-checkbox'>
        <input type="checkbox" onClick={(e) => {
          this.toggleVarbit()
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
      varbitMap: {}
    };

    this.pollVarbits = this.pollVarbits.bind(this);
    this.initVarbits = this.initVarbits.bind(this);
    this.handleToggleVarbit = this.handleToggleVarbit.bind(this);
  }

  componentDidMount() {
    this.initVarbits()
  }

  initVarbits() {
    axios.get('http://localhost:3001/retrieveVarbits')
      .then((response) => {
        let varbits = {}
        response.data.data.forEach(varbit => {
          varbits[varbit.index] = varbit
        })
        this.setState({
          varbits: response.data.data,
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
        let newState = response.data.data

        response.data.data.forEach(element => {
          newMap[element.index] = element;
        })
        let oldFilteredState = this.state.varbits.filter(function(value, index, arr){ 
          for (let i = 0; i < response.data.data.length; i++)
            if(response.data.data[i].index === value.index)
              return false;
          return true;
        })
        newState.push(...oldFilteredState)
        this.setState({
          varbits: newState,
          varbitMap: newMap
        })
      })
      .catch((error) => {
        console.log('Error: ' + error)
        this.setState({
          error: error
        })
      })
  }

  handleToggleVarbit(value, isChecked) {
    console.log(value)
    console.log(isChecked)
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

  render() {
    return (
      <div class="container">
      <VarbitList varbits={this.state.varbits} handleToggleVarbit={this.handleToggleVarbit} />
      <VarbitTimeline selected={this.state.selected} varbits={this.state.varbitMap} />
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
      <div class='varbitScrollBox'>
      <ul>
      {this.props.varbits.map((varbit) => {
        let name = varbit.name || ''
        return <VarbitCheckbox handleToggleVarbit={this.props.handleToggleVarbit} key={varbit.index} name={name} index={varbit.index} />
      })}
      </ul>
      </div>
    )
  }
}

class VarbitTimeline extends Component {
  
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div class='varbitTimeline'>
      {this.props.selected.map((varbitIndex) => {
        return (
          <p class='timeline'>{varbitIndex}: {this.props.varbits[varbitIndex].updates[this.props.varbits[varbitIndex].updates.length-1].newValue}</p>
        )
      })}
      </div>
    )
  }
}

export default App;
