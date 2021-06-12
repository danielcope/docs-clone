import React from 'react'
import EditText from './components/EditText'
import { 
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'

import './App.css'

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact >
          <Redirect to={`/documents/${uuidV4()}`}></Redirect>
        </Route>
        <Route path='/documents/:id'>
          <EditText/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
