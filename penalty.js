var express = require('express');
var app = express();
var sess;

module.exports = {
  cash : function (req, res, con, session, passport) {
    console.log("entered cash");
    sess = req.session;
    var qstr1_a = "select c1.penalty, c1.crime from cash c1, luggage l where l.passportNo = '"+passport+"' and c1.value >= l.cashQty order by c1.value limit 1";
    var qstr1_b = "select c1.penalty, c1.crime from cash c1, luggage l where l.passportNo = '"+passport+"' and c1.value < l.cashQty order by c1.value desc limit 1";
    var qstr2 =  "select count(*) as no from accused where passportNo = '"+passport+"'";
    con.query(qstr1_a, function(err, result1){
      try{
        console.log("Entered Cash penalty");
        console.log(result1);
        if(err) throw err;
        if(result1[0].penalty != 0){
          var qstr3 = "insert into typeOfCrime values('"+passport+"',1,"+result1[0].penalty+")";
          var qstr4 = "insert into accused values('"+passport+"','"+sess.officer+"',"+result1[0].crime+",0,0)";
          var qstr5 = "update accused set crime_cash = "+result1[0].crime+" where passportNo = '"+passport+"'";
          con.query(qstr3, function(err){
            try{
              if(err) throw err;
            }
            catch(err){
              console.log("Error Crime");
            }
          });
          con.query(qstr2, function(err2, result2) {
            try{
              console.log("Entered Count");
              if(result2[0].no == 0){
                con.query(qstr4, function (err_prim,result) {
                  try{
                    if(err_prim)  throw err_prim;
                  }
                  catch(err_prim){
                    con.query(qstr5);
                  }
                });
              }
              else {
                con.query(qstr5);
              }}
              catch(err2) {console.log("Count problemS");}
            })
          }
      }
      catch(err){
        console.log("Cash Penalty Error");
        con.query(qstr1_b, function(err, result3) {
          if(result3[0].penalty != 0){
            var qstr3 = "insert into typeOfCrime values('"+passport+"',1,"+result3[0].penalty+")";
            var qstr4 = "insert into accused values('"+passport+"','"+sess.officer+"',1,0,0)";
            var qstr5 = "update accused set crime_cash = 1 where passportNo = '"+passport+"'";
            con.query(qstr3);
            con.query(qstr2, function(err, result2) {
              if(result2[0].no == 0){
                con.query(qstr4, function (err_prim, result) {
                  try{
                    if(err_prim)  throw err_prim
                  }
                  catch(err_prim){
                    con.query(qstr5);
                  }
                });
              }
              else {
                con.query(qstr5);
              }
            })
          }
        })
      }
    })
    console.log("Cash exit");
    sess.check =sess.check+1;
  },
  gold : function (req, res, con, session, passport) {
    sess = req.session;
    console.log("Gold enter");
    var qstr1_a = "select c1.penalty, c1.crime from gold c1, luggage l where l.passportNo = '"+passport+"' and c1.quantity >= l.goldQty order by c1.quantity limit 1";
    var qstr1_b = "select c1.penalty, c1.crime from gold c1, luggage l where l.passportNo = '"+passport+"' and c1.quantity < l.goldQty order by c1.quantity desc limit 1";
    var qstr2 =  "select count(*) as no from accused where passportNo = '"+passport+"'";
    con.query(qstr1_a, function(err, result1){
      try{
        console.log("Entered Gold penalty");
        console.log(result1);
        if(err) throw err;
        var qstr3 = "insert into typeOfCrime values('"+passport+"',2,"+result1[0].penalty+")";
        var qstr4 = "insert into accused values('"+passport+"','"+sess.officer+"',0,"+result1[0].crime+",0)";
        var qstr5 = "update accused set crime_gold = "+result1[0].crime+" where passportNo = '"+passport+"'";
        if(result1[0].penalty != 0){
          con.query(qstr3, function(err){
            try{
              if(err) throw err;
            }
            catch(err){
              console.log("Error Crime");
            }
          });
          con.query(qstr2, function(err2, result2) {
            try{
              console.log("Entered Count");
              if(result2[0].no == 0){
                con.query(qstr4, function (err_prim, result) {
                  try{
                    if(err_prim)  throw err_prim;
                  }
                  catch(err_prim){
                    con.query(qstr5);
                  }
                });
              }
              else {
                con.query(qstr5);
              }}
              catch(err2) {console.log("Count problemS");}
            })
          }
        }
      catch(err){
        console.log("Cash Penalty Error");
        con.query(qstr1_b, function(err, result3) {
          console.log("Entered the alternate query");
          console.log(result3);
          if(result3[0].penalty != 0){
            var qstr3 = "insert into typeOfCrime values('"+passport+"',2,"+result3[0].penalty+")";
            var qstr4 = "insert into accused values('"+passport+"','"+sess.officer+"',0,1,0)";
            var qstr5 = "update accused set crime_gold = 1 where passportNo = '"+passport+"'";
            con.query(qstr3, function(err,result6){
              try{
                if(err) throw err;
              }
              catch(err){
                console.log("Error type of crime");
              }
            });
            con.query(qstr2, function(err, result2) {
              console.log(result2[0].no);
              if(result2[0].no == 0){
                con.query(qstr4, function(err_prim, result4) {
                  try{
                    if(err_prim) throw err;
                  }
                  catch(err_prim){
                    console.log("yoyo");
                    con.query(qstr5);
                  }
                });
              }
              else {
                con.query(qstr5);
              }
            })
          }
        })
      }
    })
    console.log("gold exit");
    sess.check=sess.check+1;
  },
  animal : function(req, res, con, session, passport) {
    console.log("animal enter");
    var qstr1 = "select animalId as animal from luggage where passportNo = '"+passport+"'";
    var qstr2 =  "select count(*) as no from accused where passportNo = '"+passport+"'";
    con.query(qstr1, function (err, result1) {
      var id = result1[0].animal;
      var qstr2 = "select a.penalty, a.crime from animal a where a.animalId = '"+id+"'";
      con.query(qstr2, function(err, result2) {
        if(result2[0].penalty != 0){
          var qstr3 = "insert into typeOfCrime values('"+passport+"',3,"+result2[0].penalty+")";
          var qstr4 = "insert into accused values('"+passport+"','"+sess.officer+"',0,0,"+result2[0].crime+")";
          var qstr5 = "update accused set crime_animal = '"+result2[0].crime+"' where passportNo = '"+passport+"'";
          con.query(qstr3, function(err){
            try{
              if(err) throw err;
            }
            catch(err){
              console.log("Error type of crime");
            }
          });
          con.query(qstr2, function(err, result2) {
            if(result2[0].no == 0){
              con.query(qstr4, function(err_prim, result9) {
                try{
                  if(err_prim)  throw err_prim;
                }
                catch(err_prim){
                  con.query(qstr5);
                }
              });
            }
            else {
              con.query(qstr5);
            }
          })
        }
      })
    })
    console.log("animal exitt");
    sess.check=sess.check+1;
  }
}
