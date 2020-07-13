const http= require('http');
// const http= require('https');
// const querysting=require('querystring')
const serverHandle=require('../app')
const PORT=8000
const server = http.createServer(serverHandle)
server.listen(PORT)