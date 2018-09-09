import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';

class App extends Component {
  render() {
    return (
      <div className="App">
        <TodoDashboard />
      </div>
    );
  }
}

class TodoDashboard extends Component {
  state = {
    todos: []
  };

  componentDidMount() {
    fetch('/todos')
      .then(res => res.json()) 
      .then(todos => this.setState({ todos }));
  }

  handleTrashClick = (todoId) => {
    this.deleteTodo(todoId);
  }

  deleteTodo = (id) => {
    const data = {
      todouuid: id
    };

    this.setState(prevState => {
      return {
        todos: prevState.todos.filter(t => t.todouuid !== data.todouuid)
      }
    });  

    return fetch('/todos', {
      method: 'delete',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);

  }

  handleEditFormSubmit = (attrs) => {
    this.updateTodo(attrs);
  }

  handleCreateFormSubmit = (todo) => {
    this.createTodo(todo)
  };

  updateTodo = (attrs) => {
    // {id: "17c313fd-4ebc-48b9-ab73-366375a97891", title: "1", tasks: Array(1)}

    const data = {
      todouuid: attrs.todouuid ,
      title: attrs.title,
      tasks: attrs.tasks,
    };

    this.setState(prevState => {
      return {
        todos: prevState.todos.map((todo) => {
          if (todo.todouuid === attrs.todouuid) {
            return Object.assign({}, todo, {
              title: attrs.title,
              tasks: attrs.tasks,
            })
          }
          else {
            return todo;
          }
        })
      }
    });

    fetch('/todos', {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  createTodo = (todo) => {
    const data = {
      title: todo.title || 'Todo',
      todouuid: uuidv4(),
      tasks: todo.tasks,
    };

    this.setState(prevState => {
      return {
        todos: prevState.todos.concat(data),
      }
    }); 

    fetch('/todos', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  };

  checkStatus= (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      console.log(error);
      throw error;
    }
  }

  render() {
    return (
      <div className="App">
        <EditableTodoList
          todos={this.state.todos}
          onFormSubmit={this.handleEditFormSubmit}
          onTrashClick={this.handleTrashClick}
        />
        <ToggleableTodoForm
          onFormSubmit={this.handleCreateFormSubmit} />
      </div>
    );
  }
}

class ToggleableTodoForm extends React.Component {
  state = {
    isOpen: false,
  };

  handleFormOpen = () => {
    this.setState({ isOpen: true });
  };

  handleFormClose = () => {
    this.setState({ isOpen: false });
  };

  handleFormSubmit = (todo) => {
    this.props.onFormSubmit(todo);
    this.setState({ isOpen: false });
  };

  render() {
    if (this.state.isOpen) {
      return (
        <TodoForm
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

class EditableTodoList extends React.Component {
  render() {
    const todos = this.props.todos.map((todo) => (
      <EditableTodo
        key={todo.todouuid}
        todouuid={todo.todouuid}
        title={todo.title}
        tasks={todo.tasks}
        onFormSubmit={this.props.onFormSubmit}
        onTrashClick={this.props.onTrashClick}
      />
    )
    );
    return (
      <div id='todos'>
        {todos}
      </div>
    );
  }
}

class EditableTodo extends React.Component {
  state = {
    editFormOpen: false,
  };

  handleEditClick = () => {
    this.openForm();
  }

  handleFormClose = () => {
    this.closeForm();
  }

  handleSubmit = (todo) => {
    this.props.onFormSubmit(todo);
    this.closeForm();
  }

  closeForm = () => {
    this.setState({ editFormOpen: false })
  }

  openForm = () => {
    this.setState({ editFormOpen: true });
  }

  render() {
    if (this.state.editFormOpen) {
      return (
        <TodoForm
          todouuid={this.props.todouuid}
          title={this.props.title}
          tasks={this.props.tasks}
          onFormSubmit={this.handleSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <Todo
          todouuid={this.props.todouuid}
          title={this.props.title}
          tasks={this.props.tasks}
          onEditClick={this.handleEditClick}
          onTrashClick={this.props.onTrashClick}
        />
      );
    }
  }
}

class Todo extends React.Component {
  handleTrashClick = () => {
    this.props.onTrashClick(this.props.todouuid);
  };

  render() {
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <TasksList
            tasks={this.props.tasks}
          />
          <div className='extra content'>
            <span
              className='right floated edit icon'
              onClick={this.props.onEditClick}
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
      </div>
    );
  }
}


class TaskFormList extends React.Component {   
  render() {
    let tasks = null;
    if (this.props.tasks) {
    tasks = this.props.tasks.map((task) => (
      <TaskForm
        uuid={task.uuid}
        key={task.uuid}
        text={task.text}
        onTaskDelete={this.props.handleTaskDelete}
        onTaskTextChange={this.props.handleTaskTextChange} 
      />
    )
    );
  }
    return (
      <div>
        {tasks}
      </div>
    );
  }
}

class TodoForm extends React.Component {
  state = {
    title: this.props.title || '',
    tasks: this.props.tasks || [],
  };

  handleTaskDelete = (taskId) => {
    
    this.setState(prevState => {
      return {
        tasks: prevState.tasks.filter(t => t.uuid !== taskId)//////////////////////////////////////////////////////////////////////////////////////////////////////////
      }
    });
  }

  handleTaskTextChange = (attrs) => {
    this.updateElement(attrs)
  }

  updateElement = (attrs) => {
    this.setState(prevState => {
      return {
        tasks: prevState.tasks.map((element) => {
          if (element.uuid === attrs.uuid) {
            return Object.assign({}, element, {
              text: attrs.text,
            })
          }
          else {
            return element;
          }
        })
      }
    });
  }

  handleTitleChange = (e) => {
    this.setState({ title: e.target.value });
  };

  handleSubmit = () => {
    this.props.onFormSubmit({
      todouuid: this.props.todouuid,
      title: this.state.title,
      tasks: this.state.tasks,
    });
  }

  handleTaskFormCreate = (attr) => {
    this.addElement(attr)
  }

  addElement = (attr) => {
    const t = {
      text: attr.text,
      uuid: uuidv4(),
    };
    
    this.setState(prevState => {
      return {
        tasks: prevState.tasks.concat(t),
      }
    });
  }

  render() {  

    const submitText = this.props.todouuid ? 'Update' : 'Create';

    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input
                type='text'
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
            <div className='field'>
            </div>

            Tasks
            <TaskFormList
              tasks = {this.state.tasks}
              handleTaskDelete={this.handleTaskDelete}
              handleTaskTextChange={this.handleTaskTextChange} 
            />

            <ToggleableTaskForm
              onTaskFormCreate={this.handleTaskFormCreate}
            />
            <div className='ui two bottom attached buttons'>
              <button
                className='ui basic blue button'
                onClick={this.handleSubmit}
              >
                {submitText}
              </button>
              <button
                className='ui basic red button'
                onClick={this.props.onFormClose}
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

class TaskForm extends React.Component {
  state = {
    text: this.props.text || '',
  }

  handleTaskDelete = () => {
    this.props.onTaskDelete(this.props.uuid)
  };

  handleTextChange = (e) => {
    this.setState({ text: e.target.value }, this.handleTaskTextChange)
  };

  handleTaskTextChange = () => {
    this.props.onTaskTextChange({
      uuid: this.props.uuid,
      text: this.state.text,
    })
  };

  
  render() {
    return (
      <div className='content'>
        <div className='ui form'>
          <div className='field'>
            <div className="ui action input">
              <input
                type="text"
                value={this.state.text}
                onChange={this.handleTextChange}
              />

              <button
                className='ui red button icon'
                onClick={this.handleTaskDelete}
              >
                <i className='trash icon' />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class TaskFormCreate extends React.Component{
  state = {
    text: this.props.text || '',
  }

  handleTaskTextChange = (e) => {
    this.setState({ text: e.target.value })
  };

  handleSave = () => {
    this.props.onTaskFormCreate({ text: this.state.text });
    this.props.onFormClose();
  }

  render() {
    return (
      <div className='content'>
        <div className='ui form'>
          <div className='field'>
          <br/>
            <input
              type='text'
              value={this.props.text}
              onChange={this.handleTaskTextChange}
            />
            <div className="mini ui two bottom attached buttons">
              <div
                className="ui green button"
                onClick={this.handleSave}
              >
                Save
              </div>
              <div
                className="ui red button"
                onClick={this.props.onFormClose}
              >
                Cancel
              </div>
            </div>
          <br/>
  
          </div>
        </div>
      </div>
    );
  }
} 

class ToggleableTaskForm extends React.Component {
  state = {
    isOpen: false,
  }

  handleTaskFormOpen = () => {
    this.setState({ isOpen: true });
  }

  handleTaskFormClose = () => {
    this.setState({ isOpen: false });
  }

  render() {
    if (this.state.isOpen) {
      return (
        <TaskFormCreate
          onFormClose={this.handleTaskFormClose}
          onTaskFormCreate={this.props.onTaskFormCreate}
        />
      );
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button
            className='mini ui blue button'
            onClick={this.handleTaskFormOpen}
          >
            add task
          </button>
        </div>
      );
    }
  }
}

class TasksList extends React.Component {
  render() {
    const tasks = this.props.tasks.map((task) => (
      <div
        className="ui segment"
        key={task.uuid}
      >
        <p>{task.text}</p>
      </div>
    )
    );
    return (
      <div className='content'>
        <div className="tiny ui segments">
          {tasks}
        </div>
      </div>
    );
  }
}

export default App;

