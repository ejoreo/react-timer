class TimersDashboard extends React.Component {
  //this is property initialization syntax thanks to Babel plugin transform-class-properties
  state = {
    timers: [],
  };

  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  };

  loadTimersFromServer = () => {
    client.getTimers((serverTimers) => (
      this.setState({ timers: serverTimers })
      )
    );
  };

  handleCreateFormSubmit = (timer) => {
    this.createTimer(timer);
  };

  handleEditFormSubmit = (attrs) => {
    this.updateTimer(attrs);
  };

  handleTrashClick = (timerID) => {
    this.deleteTimer(timerID);
  };

  handleStopClick = (timerID) => {
    this.stopTimer(timerID);
  };

  handleStartClick = (timerID) => {
    this.startTimer(timerID);
  };  

  startTimer = (timerID) => {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === timerID) {
          return Object.assign({}, timer, {
            runningSince: now,
          });
        } else {
          return timer;
        }
      }),
    });

    client.startTimer(
      { id: timerID, start: now }
    );
  };

  stopTimer = (timerID) => {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === timerID) {
          const lastElapsed = now - timer.runningSince;
          return Object.assign({}, timer, {
            elapsed: timer.elapsed + lastElapsed,
            runningSince: null,
          });
        } else {
          return timer;
        }
      }),
    });

    client.stopTimer(
      { id: timerID, stop: now }
    );
  };

  deleteTimer = (timerID) => {
    //deleting it locally
    this.setState({
      timers: this.state.timers.filter(t => t.id !== timerID)
    });

    //deleting it from the client
    client.deleteTimer(
      { id: timerID }
    );
  }; 

  createTimer = (timer) => {
    const t = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t),
    });

    client.createTimer(t);
  };

  updateTimer = (attrs) => {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === attrs.id) {
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project,
          });
        } else {
          return timer;
        }
      }), 
    });

    client.updateTimer(attrs);
  };

  render() {
    return (
      <div className='ui three column centered grid'> <div className='column'>
        <EditableTimerList 
          timers={this.state.timers}
          onFormSubmit={this.handleEditFormSubmit} 
          onTrashClick={this.handleTrashClick} 
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}        
        />
        <ToggleableTimerForm
          onFormSubmit={this.handleCreateFormSubmit} 
        />
        </div>
      </div>
    );
  };
}

class EditableTimerList extends React.Component {
  render() {

    const timers = this.props.timers.map((timer) => (
      <EditableTimer 
        key={timer.id}
        id={timer.id}
        title={timer.title}
        project={timer.project}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
        onFormSubmit={this.props.onFormSubmit}
        onTrashClick={this.props.onTrashClick}
        onStartClick={this.props.onStartClick}
        onStopClick={this.props.onStopClick}
      />
    ));

    return (
      <div id='timers'>
        {timers}
      </div>
    );
  }
}

class EditableTimer extends React.Component {

  state = {
    editFormOpen: false,
  };

  handleEditClick = () => {
    this.openForm();
  };


  handleFormClose = () => {
    this.closeForm();
  };

  handleSubmit = (timer) => {
    this.props.onFormSubmit(timer);
    this.closeForm();
  };

  closeForm = () => {
    this.setState({ editFormOpen: false });
  };

  openForm = () => {
    this.setState({ editFormOpen: true });
  };

  render() {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormSubmit={this.handleSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onTrashClick={this.props.onTrashClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
      );
    }
  }
}

class TimerForm extends React.Component {

  constructor(props) {
    super(props);

    //each of these propertoes correspond to an input field that TimerForm manages
    this.state = {
      title: this.props.title || '',
      project: this.props.project || ''
    };
  }

  handleTitleChange = (e) => {
    this.setState({ title: e.target.value });
  };

  handleProjectChange = (e) => {
    this.setState({ project: e.target.value });
  };

  handleCancel = () => {
    this.props.onFormClose();
  };

  handleSubmit = () => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project,
    }); 
  };

  render() {
    const submitText = this.props.id ? 'Update' : 'Create';
    // condition ? expression1 : expression2 = ternary operator
    //if there is a title prop, show 'Update' button, else show 'Create' button
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Exercise</label>
              <input 
                type='text' 
                value={this.state.title} 
                onChange={this.handleTitleChange}
              />
            </div>
            <div className='field'>
              <label>Description</label>
              <input 
                type='text' 
                value={this.state.project} 
                onChange={this.handleProjectChange}
              />
            </div>
            <div className='ui two bottom attached buttons'>
              <button 
                className='ui basic green button'
                onClick={this.handleSubmit}
              >
                {submitText}
              </button>
              <button 
                className='ui basic red button'
                onClick={this.handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ToggleableTimerForm extends React.Component {
  state = {
    isOpen: false,
  };

  //writing this as an arrow function ensures that 'this' is bound to the component
  handleFormOpen = () => {
    this.setState({ isOpen: true });
  };

  handleFormClose = () => {
    this.setState({ isOpen: false });
  };

  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer);
    this.setState({ isOpen: false });
  };


  render() {
    if (this.state.isOpen) {
      return (
        <TimerForm 
          onFormSubmit={this.handleFormSubmit} 
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button
            className='ui basic button icon'
            onClick={this.handleFormOpen}
          >
            <i className='plus icon' />
          </button>
        </div>
      );
    }
  }
} 


class Timer extends React.Component {

  componentDidMount() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 60);
  };
  
  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  };

  handleStartClick = () => {
    this.props.onStartClick(this.props.id)
  };

  handleStopClick = () => {
    this.props.onStopClick(this.props.id)
  };

  handleEditClick = () => {
    this.props.onEditClick()
  };


  handleTrashClick = () => {
    this.props.onTrashClick(this.props.id);
  };

  render() {
    const elapsedString = helpers.renderElapsedString(
      this.props.elapsed,
      this.props.runningSince
    );

    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2 className="animate-me">
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span 
              className='right floated edit icon'
              onClick={this.handleEditClick}
            >
              <i className='edit icon' />
            </span>
            <span 
              className='right floated trash icon'
              onClick={this.handleTrashClick}
            >
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}
        />
      </div>
    );
  }
}

class TimerActionButton extends React.Component {
  render() {
    if (this.props.timerIsRunning) {
      return (
        <div
          className='ui bottom attached red basic button'
          onClick={this.props.onStopClick} 
        >
        Stop
        </div>
      );
    } else {
      return (
        <div
          className='ui bottom attached green basic button'
          onClick={this.props.onStartClick} 
        >
         Start
        </div>
      ); 
    }
  } 
}

ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
 );