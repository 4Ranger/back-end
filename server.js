const express = require('express')
const app = express()
const bcrypt = require('bcrypt')


app.use(express.json())
const users = []

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {
    try{
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hashSync(req.body.password, salt)
        
        const user = { name : req.body.name, password: hash }
        users.push(user)
        res.status(201).send(`Welcome to Wastify, ${user.name}!`)
    }

    catch{
        res.status(500).send()
    }

})

app.post('/users/login', async (req, res) => {
 const user = users.find(user => user.name === req.body.name)
 
 if(user == null){
    return res.status(400).send("Invalid username")
 }

 try{
    if(await bcrypt.compare(req.body.password, user.password)){
        res.send(`Welcome back to Wastify, ${user.name}!`)
    } 
    else {
        res.status(400).send("who are you?")
    }
}
 catch{
    return res.status(500).send()
 }
})

app.listen(3000)