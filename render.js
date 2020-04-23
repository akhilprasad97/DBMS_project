var fs = require('fs');
var url = require('url');
const express = require('express');
const app = express();

/*function renderHtml(path,res){
  fs.readFile(path,null,function(err, data){
    if(err){
      res.write(404);
    }
    else{
      res.write(data);
      res.end();
    }
  });
}

module.exports = {
  handler : function(req,res){
    res.writeHead(200, {'Content-Type':'text/html'});
    var path = url.parse(req.url).pathname;
    switch (path) {
      case '/':

        renderHtml('./public/html/home.html',res);
        break;
      case '/admin':
        renderHtml('./public/html/admin.html',res);
        break;
      default:

    }
  }
}*/
module.exports = {
  handler :
  })
}
