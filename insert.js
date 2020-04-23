var express = require('express')
var app = express();
var sess;

module.exports = {
  passenger : function(req,res,con,session) {
    sess = req.session;
    var qstr = "insert into passenger values('"+req.body.pno.toUpperCase()+"','"+req.body.nation+"','"+req.body.visa.toUpperCase()+"','"+req.body.pname.toUpperCase()+"')";
    con.query(qstr,function(err, result) {
      try{
        if(err) throw err;
        console.log("Record Inserted");
        sess.passport = req.body.pno;
        res.redirect('/update_luggage_details')
      }
      catch(err){
        res.render('passenger',{image: '',link: '/action_passenger_details', tagline: 'Incorrect Details'})
      }
    })
  },
  luggage : function(req,res,con,session) {
    sess = req.session;
    console.log(req.body.animal);
    var animalId;
    var qstr1 = "select animalId from animal where animalname = '"+req.body.animal+"'";
    con.query(qstr1, function(err, result) {
      console.log(result);
      console.log(result[0].animalId);
      var qstr2 = "insert into luggage values('"+sess.passport.toUpperCase()+"','"+req.body.cash+"','"+req.body.gold+"','"+result[0].animalId+"',0)";
      con.query(qstr2, function(err, result){
        try{
          if(err) throw err;
          console.log("Record Inserted");
          res.redirect('correct_credentials_officer')
        }
        catch(err){
          res.render('luggage',{image: '',link: '/action_luggage_details', tagline: 'Incorrect Details'})
        }
      })
    })
  }
}
