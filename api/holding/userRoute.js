const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../models/users').model

const router = express.Router();

router.get('/', (req, res) => res.send('hi'))

router.post('/signup', async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const newUser = await Users.create({username: username, password: hashedPassword, role: 'user'});
    res.json({username: newUser.username});
});

/**
 * Make a route for the user to login.
 * When logging in, check if the user exists first or not
 * If user exists, check password match the one on the database.
 * 
 * If password matches, generate a JWT token and return the token back to the user.
 * On the frontend, store the token somewhere (typically we put in localstorage)
 */
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    const foundUser = await Users.findOne({username: username});

    if (! foundUser) {
        res.json({error: 'Not a valid username'});
    }

    const isCorrectPassword = bcrypt.compareSync(password, foundUser.password);

    console.log(isCorrectPassword)

    if (! isCorrectPassword) {
        res.json({error: 'Password incorrect'});
    }

    /**
   * This line of code basically generates a token, you need to put in the same secret used for verification
   */
    const token = jwt.sign({
        username: username
    }, process.env.JWT_SECRET);

    res.json({token: token});
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    const foundUser = await Users.findOne({ username: username });
  
    if (!foundUser) {
      res.json({ error: 'Not a valid username' });
    }
    
    const isCorrectPassword = bcrypt.compareSync(password, foundUser.password);
  
    if (isCorrectPassword) {
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET)
        res.json({token: token})
    } else {
        res.json({ error: 'Password incorrect' });
        // to debug
    }
  });
  

module.exports = router;
