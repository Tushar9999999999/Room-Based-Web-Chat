//Using useContext Hook to use any state as a global variable
import {createContext, useState, useEffect} from 'react' 
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {Container} from 'react-bootstrap'
//Automatically converts to JSON hence easier to use than fetch
import axios from 'axios'

import Header from './components/Header'
import Welcome from './components/Welcome'
import About from './components/About'
import Contact from './components/Contact'
import Register from './components/auth/Register'
import Profile from './components/auth/Profile'
import Login from './components/auth/Login'
import Chat from './components/Chat'

//Declaring and Exporting the createContext()
export const UserContext = createContext()

function App() {
  //Use the useState hook to create userData state consisting of token and user
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
  })

  //useEffect hook to check a particular code every time the app is rendered
  //Defination - Whenever the array(2nd parameter) changes the function(1st parameter) is called
  useEffect(() => {
    const isLoggedIn = async () => {
      //Getting the token from the local storage
      let token = localStorage.getItem("auth-token")
      //If no token then create an empty space for it in local storage
      if (token == null){
        localStorage.setItem("auth-token", "")
        token = ""
      }

      //Else check the validity of the token using the 'isValid' func //It will store true or false
      //Hence we check if the user is logged in or not
      const tokenResponse = await axios.post(
        '/api/users/tokenIsValid', 
        null, 
        {headers: {"auth-token": token}}
      )

      console.log(tokenResponse.data)
      //if the token is valid then use the get request from the profile ednpoint and return the user data in the response
      if(tokenResponse.data){
        const userResponse = await axios.get('/api/users/profile',
          {headers: {'auth-token': token}}
        )
        //Storing here
        setUserData({
          token: token,
          user: userResponse.data
        })
      }
    }
    isLoggedIn()
  }, [])

  return (
    //Sends the userData so that it can be used in any component as global var
    <UserContext.Provider value={{ userData, setUserData }}>
      <Router>
        <Header/>
        <Container>
          <Route path='/' exact component={Welcome} />
          <Route path='/about' exact component={About} />
          <Route path='/contact' exact component={Contact} />
          <Route path='/register' exact component={Register} />
          <Route path='/profile' exact component={Profile} />
          <Route path='/login' exact component={Login} />
          <Route path='/chat' exact component={Chat} />
        </Container>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
