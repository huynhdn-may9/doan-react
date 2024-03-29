import React from "react";
import {
  BrowserRouter,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import SidebarComponent from './sidebar/sidebar'
import EditorComponent from './editor/editor'
import { firebase } from '@firebase/app'
import Login from './login/login'


class App extends React.Component {
  constructor() {
    super()
    this.state = {
      Login: this.Login,
      selectedNoteIndex: null,
      selectedNote: null,
      notes: null
    }

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    // <Router exact path="/login" component={Login}/>
  }
  render() {
    return (
      <BrowserRouter>
        <div className="app-container">
          <SidebarComponent
            selectedNoteIndex={this.state.selectedNoteIndex}
            notes={this.state.notes}
            selectNote={this.selectNote}
            deleteNote={this.deleteNote}
            newNote={this.newNote} />

          <button className="btn" >

            <Route component={Login}>
              <Link to="/login">Login</Link>
            </Route>
          </button>
          {
            this.state.selectedNote ?
              <EditorComponent
                selectedNote={this.state.selectedNote}
                selectedNoteIndex={this.state.selectedNoteIndex}
                notes={this.state.notes}
                noteUpdate={this.noteUpdate} /> :
              null
          }


        </div>
      </BrowserRouter>
    )

  }

  componentDidMount = () => {
    firebase
      .firestore()
      .collection('notes')
      .onSnapshot(serverUpdate => {
        const notes = serverUpdate.docs.map(_doc => {
          const data = _doc.data()
          data['id'] = _doc.id
          return data
        })
        this.setState({ notes: notes })
      }) //
  }

  selectNote = (note, index) => {
    this.setState({ selectedNoteIndex: index, selectedNote: note })
  }

  noteUpdate = (id, noteObj) => {
    firebase
      .firestore()
      .collection('notes')
      .doc(id)
      .update({
        title: noteObj.title,
        body: noteObj.body,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
  }

  newNote = async () => {
    const note = {
      title: '',
      body: ''
    }
    const newFromDB = await firebase
      .firestore()
      .collection('notes')
      .add({
        title: note.title,
        body: note.body,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
    const newID = newFromDB.id
    await this.setState({ notes: [...this.state.notes, note] })
    const newNoteIndex = this.state.notes.indexOf(this.state.notes.filter(_note => _note.id === newID)[0])
    this.setState({ selectedNote: this.state.notes[newNoteIndex], selectedNoteIndex: newNoteIndex })
  }

  deleteNote = async (note) => {
    const noteIndex = this.state.notes.indexOf(note)
    await this.setState({ notes: this.state.notes.filter(_note => _note !== note) })
    if (this.state.selectedNoteIndex === noteIndex) {
      this.setState({ selectedNoteIndex: null, selectedNote: null })
    } else {
      this.state.notes.length > 1
        ?
        this.selectNote(this.state.notes[this.state.selectedNoteIndex - 1], this.state.selectedNoteIndex - 1)
        :
        this.setState({ selectedNoteIndex: null, selectedNote: null })
    }
    firebase
      .firestore()
      .collection('notes')
      .doc(note.id)
      .delete()
  }

}

export default App;