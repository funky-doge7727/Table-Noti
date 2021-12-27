import React, { useState } from "react";
import {Row, Col, Button} from "reactstrap";

export default props => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const backEndDomain = process.env.REACT_APP_BACK_END_DOMAIN 
  
    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
    }
  
    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    }
  
    const handleClickLogin = async () => {
      const response = await fetch(`${backEndDomain}/user/signin`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password,
        })
      })
  
      const result = await response.json();
  
      if (result.error) {
        alert('Incorrect username or password. Please try again.');
      }
  
      if (result.token) {
        localStorage.setItem('token', result.token);
        props.setPage(1)
      }
    }


    return (
        <div>
            <Row noGutters className="text-center align-items-center pizza-cta">
                <Col>
                <h2>Login</h2>
                    <label for="username">Username</label>
                    <input type="text" name="username" onChange={handleUsernameChange} />
                    <br />
                    <label for="password">Password</label>
                    <input type="password" name="password" onChange={handlePasswordChange} />
                    <br />
                    <Button 
                color="none"
                className="book-table-btn"
                onClick={handleClickLogin}
              >
                Login
              </Button>
                </Col>
            </Row>
        </div>
    );
};
