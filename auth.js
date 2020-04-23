var express = require('express');
var app = express();
var sess;

module.exports = {
  admin : function(req, res, con,session){
      sess = req.session;
      sess.admin_user = req.body.uname;
      sess.admin_password = req.body.psw;
      console.log("Database Connected");
      console.log(sess.user);
      con.query("select password from admin where username = '"+sess.admin_user+"'",function(err,result,fields){
        try{
          if(err){
            throw(err);
          }
          else {
            console.log(result[0].password);
            console.log(sess.admin_password);
            if(result[0].password == undefined || !(result[0].password==sess.admin_password)){
              console.log("Incorrect Passowrd");
              res.render('form',{tagline: 'Incorrect Credentails',image: '/images/admin.png',link:"/action_admin"})
            }
            else {
              res.redirect('correct_credentials_admin')
            }
          }
        }
        catch(err){
          console.log("Incorrect Username")
          res.render('form',{tagline: 'Incorrect Credentails',image: '/images/admin.png',link:"/action_admin"})
        }
      })
    },
  officer : function functionName(req, res, con, session) {
    sess = req.session;
    sess.officer_user = req.body.uname;
    sess.officer_password = req.body.psw;
    var qstr = "select officerId from authentication where username ='"+sess.officer_user+"' and password = '"+sess.officer_password+"'";
    console.log(sess.officer_user);
    console.log(sess.officer_password);
    con.query(qstr,function(err, result, fields) {
      console.log(result);
      try{
        if(err){
           throw err;
         }
        else {
          sess.officer = result[0].officerId;
          console.log(sess.officer);
        res.redirect('correct_credentials_officer');
        }
      }
      catch(err){
        res.render('form',{tagline: 'Incorrect Credentails',image: '/images/admin.png',link:"/action_officer"})
      }
    })
  }
}
