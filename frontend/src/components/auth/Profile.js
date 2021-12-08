import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../App";
import axios from "axios";
//import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

const Profile = () => {
  const { userData, setUserData } = useContext(UserContext);

  const userDelete = () => {
    //Send delete request to backend with the token for verification
    axios
      .delete("/api/users/profile", {
        headers: {
          "auth-token": userData.token,
        },
      })
      .then((window.location = "/"));

    setUserData({
      token: undefined,
      user: undefined,
    });
    localStorage.setItem("auth-token", "");
  };

  return (
    <div id="bg6">
      <h1>User Profile of {userData.user.name}</h1>
      <br />
      <h5>
        <b>User ID: </b>
        {userData.user.id}
      </h5>
      <h5>
        <b>Register Date: </b>
        {userData.user.date.toString().slice(0, 10) +
          " @ " +
          userData.user.date.toString().slice(11, 19)}
      </h5>

      <Button className="btn btn-danger" onClick={userDelete}>
        Delete Account
      </Button>
    </div>
  );
};

export default Profile;