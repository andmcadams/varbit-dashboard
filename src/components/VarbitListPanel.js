import React, {Component} from 'react';
import VarbitListBody from './VarbitListBody'
import VarbitListHeader from './VarbitListHeader'

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
    let varbitList = <VarbitListBody {...this.props} showVarbitSelect={this.state.showVarbitSelect} sortByRecent={this.state.sortByRecent} />

    return (
      <div class='varbit-list-panel'>
        <button onClick={this.handleToggleVarbitList}>I</button>
        <VarbitListHeader {...this.props} />
        {varbitList}
      </div>
    )
  }
}

export default VarbitListPanel