import React, { useState } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const handleClickLogin = async () => {

    const response = await fetch("/api/users/login", {
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
      alert('Cannot login');
    }

    if (result.token) {
      localStorage.setItem('token', result.token);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <label for="username">Username</label>
      <input type="text" name="username" onChange={handleUsernameChange} />
      <br />
      <label for="password">Password</label>
      <input type="password" name="password" onChange={handlePasswordChange} />
      <br />
      <button onClick={handleClickLogin}>Login</button>
    </div>
  )
}

export default LoginPage;
