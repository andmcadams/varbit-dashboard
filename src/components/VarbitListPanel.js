import React, {Component} from 'react';
import VarbitListBody from './VarbitListBody'
import VarbitListHeader from './VarbitListHeader'
import './VarbitListPanel.css'

class VarbitListPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showVarbitSelect: true,
      sortStyle: 'recent'
    };

    this.handleToggleVarbitList = this.handleToggleVarbitList.bind(this);
    this.handleOrderChange = this.handleOrderChange.bind(this);
  }

  handleToggleVarbitList() {
    this.setState({
      showVarbitSelect: !this.state.showVarbitSelect
    });
  }

  handleOrderChange(e) {
    console.log(e.target.value)
    this.setState({
      sortStyle: e.target.value
    })
  }

  render() {
    let varbitList = <VarbitListBody {...this.props} showVarbitSelect={this.state.showVarbitSelect} sortStyle={this.state.sortStyle} />

    return (
      <div class='varbit-list-panel'>
        <VarbitListHeader {...this.props} sortStyle={this.state.sortStyle} handleToggleVarbitList={this.handleToggleVarbitList} handleOrderChange={this.handleOrderChange} />
        {varbitList}
      </div>
    )
  }
}

export default VarbitListPanel