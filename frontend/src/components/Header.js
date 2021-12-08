import React, { useContext } from "react"
import { UserContext } from "../App";
import {Navbar, Nav, Container} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

const Header = () => {
    const { userData, setUserData } = useContext(UserContext);

    //Upon logout set the token and the user data to undefined
    //Also make the localstorage item empty
    const logOut = () => {
        setUserData({
        token: undefined,
        user: undefined,
        });
        localStorage.setItem("auth-token", "");
    };

    return(
        <div>
            <Navbar bg="light" expand="lg">
                <Container id="bg7">
                    <LinkContainer to='/'>
                        <Navbar.Brand>WELCOME</Navbar.Brand>
                    </LinkContainer>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <LinkContainer to='/about'>
                            <Nav.Link>About</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to='/contact'>
                            <Nav.Link>Contact</Nav.Link>
                        </LinkContainer>
                    </Nav>
                    {/* Conditional rendering */}
                    {userData.user ? (
                    <Nav className="ml-auto">
                        <LinkContainer to="/chat">
                            <Nav.Link>Chat</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/profile">
                            <Nav.Link>Profile ({userData.user.name})</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/login">
                            <Nav.Link onClick={logOut}>Log Out</Nav.Link>
                        </LinkContainer>
                    </Nav>
                    ) : (
                    <Nav className="ml-auto">
                        <LinkContainer to="/register">
                            <Nav.Link>Register</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/login">
                            <Nav.Link>Log In</Nav.Link>
                        </LinkContainer>
                    </Nav>
                    )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    )
}

export default Header