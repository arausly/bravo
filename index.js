const http = require('http');
const path = require('path');
const fs  = require('fs');
const url = require('url');
const dns = require('dns');
const https = require('https');



const port = process.env.PORT || 4000;
let counter = {
    successFulAttempts:{
       count:0,
       date_occured:'',
       status:'',
    },
    failedAttempts:{
        issue:'',
        count:0,
        date_occured:''
    }
 };


dns.resolve('google.com',(error, res)=> {
   if(error){
      counter.failedAttempts.issue = "Server is probably down";
      counter.successFulAttempts.status = "";
      
   }else{
    counter.failedAttempts.issue = "";
    counter.successFulAttempts.status = "Server is up and running";
   }
})

const secretOptions = {
    key:fs.readFileSync(path.join(__dirname,'./secrets/key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./secrets/cert.pem')),
}

const httpsServer = http.createServer((req, res)=>{

   let path  = url.parse(req.url,true).pathname.replace(/\/+$/,'');
   console.log(path)
   
    let requestDetails = {
        protocol:'https:',
        hostname:'stackoverflow.com',
        path:'/users/8329515/arausi-daniel',
        method:'GET',
        headers:{
            'Content-Type':'text/html'
        }
    }
    const scheduler = (timeFrame,cb) =>{
      if(!timeFrame) throw new Error('No time frame input');
      return setInterval(()=>{
           cb();
      },timeFrame);
    }

    const makeRequest = () => {
       let req =  https.request(requestDetails,(res=>{
            if(res && res.statusCode === 200){
                 counter.successFulAttempts.count+=1;
                 counter.successFulAttempts.date_occured = Date().now()
            }else{
                counter.failedAttempts.count+=1;
                counter.failedAttempts.date_occured =  Date().now()
                throw new Error('Could not make request successfully');
            }
       }));
       
       req.on('error',()=>console.log("There was an error"));
       req.end();

    }
    // make request every 24hrs
    let timeFrame = 1000 * 60 * 60 * 24;
    scheduler(timeFrame,makeRequest);
  
    if(path === '/status'){
       let resObj  = {
           response:{
               data:counter,
               status:200,
               message:'Successful status request'
           }
       }
       res.setHeader("Content-Type","applicaion/json");
       res.end(JSON.stringify(resObj));
    }else if(path === "/ping"){
        let resObj= {
            response:{
                data:[],
                status:200,
                message:`Server is running on port ${port}` 
            }
        }
        res.setHeader("Content-Type","application/json");
        res.end(JSON.stringify(resObj));
    }
})

httpsServer.listen(port,(err)=>{
    err ? console.log(`Error running Server on port ${port}`)
     : console.log(`Server is running at port ${port}`);
});