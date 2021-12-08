import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App"
import { Container, Col, Row } from "react-bootstrap";
import io from "socket.io-client";

const socket = io();

const Chat = () => {
  const [chatUsers, setChatUsers] = useState([]) //Array storing the connected user ids
  //chatMessage state for an object to store the name, message, room and wheter its private or not
  const [chatMessage, setChatMessage] = useState({name: "", msg: "", room: "", isPrivate: false})
  //An array called 'msgList' to store all the messages
  const [msgList, setMsgList] = useState([])
  //Another state to display the room we are currently in on the right side //Default = 'General Chat'
  const [currentRoom, setCurrentRoom] = useState("General Chat")

  //useEffect hook is used to update the connection id's every time the chat component is rendered
  useEffect(() => {
    socket.emit("userJoin", userData.user.name);
  }, []);

  //Using the useContext hook to make the users list global
  const { userData, setUserData } = useContext(UserContext)

  //Whenever a new message arrives from the server we add the message to the array
  socket.on("newMessage", newMessage => {
    setMsgList([...msgList, {name: newMessage.name, msg: newMessage.msg, isPrivate: newMessage.isPrivate}])
  })

  //Whenever a event called 'userList' is emitted from the server then take the data and store it in the array
  socket.on("userList", (userList) => {
    setChatUsers(userList);
    setChatMessage({name: userData.user.name, msg: chatMessage.msg})
  });

  //Use the spread operator to add the the property from the input field
  const handleChange = (e) => {
    setChatMessage({...chatMessage, [e.target.name]: e.target.value})
  }

  //Emitting the message to the server
  const newMessageSubmit = (e) => {
    e.preventDefault()
    const newMessage = {
      name: chatMessage.name,
      msg: chatMessage.msg,
      room: currentRoom,
      isPrivate: isChatPrivate(currentRoom, chatUsers)
    }

    socket.emit("newMessage", newMessage)

    setChatMessage({
      name: userData.user.name,
      msg: ""
    })
  }

  //Grabbing the room name
  const enteringRoom = (e) => {
    let oldRoom = currentRoom
    let newRoom = e.target.textContent
    setCurrentRoom(newRoom)
    socket.emit("roomEntered", { oldRoom, newRoom })
    //Making the message list array empty before entering the new room
    setMsgList([])
  }

  //Check if it is private chat or not (Done by comparing roomname and user name)
  const isChatPrivate = (roomName, userList) => {
    let isPrivate = false
    userList.forEach(userName => {
      if(userName === roomName){
        isPrivate = true
      }
    })
    return isPrivate
  }

  return (
    <Container>
      <Row>
        <Col xs={5} style={{ border: "1px solid black" }}>
          <br/>
          <h6 onClick={enteringRoom} style={{ cursor: "pointer" }}>General Chat</h6>
          <br />
          <p><b>Chat Rooms</b></p>
          <ul style={{ listStyleType: "none" }}>
            <li onClick={enteringRoom} style={{ cursor: "pointer" }}>A</li>
            <li onClick={enteringRoom} style={{ cursor: "pointer" }}>B</li>
            <li onClick={enteringRoom} style={{ cursor: "pointer" }}>C</li>
          </ul>
          <p><b>Currently Connected Users:</b></p>
          <ul style={{ listStyleType: "none" }}>
            {/* Map every user to display on the side */}
            {chatUsers.map((user) => {
              //Making the user clickable to implement private chatting
              return <li onClick={enteringRoom} style={{cursor:"pointer"}}
                key={user}>{user}</li>;
            })}
          </ul>
        </Col>
        <Col style={{ border: "1px solid black" }}>
          <p>Chat Messages ({currentRoom})</p>
          <form onSubmit={newMessageSubmit}>
            <input type="text" name="msg" 
              value={chatMessage.msg}
              onChange={handleChange} required style={{ width: "90%" }} />
            <input type="submit" value="Message!" />
          </form>
          <div id="chatMessages" style={{ border: "1px solid black" }}>
            Messages
            {/* Displaying the messages as an unordered list using mapping */}
            <ul style={{ listStyle:"none" }}>
              {msgList.map((msgList, index) => {
                return (
                  <li key={index}>
                    <b>{msgList.name}: </b>
                    {/* Conditional Styling for private chat to be in red */}
                    <i>
                      <span style={{color: msgList.isPrivate ? "red" : "black"}}>
                        {msgList.msg}
                      </span></i>
                  </li>
                )
              })}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;