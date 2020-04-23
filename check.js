var express = require('express')
var app = express();
var sess;

module.exports = {
  luggage : function (req,res,con,session) {
    sess = req.session;
    var qstr = "select p.passportNo,p.name from passenger p, luggage l where l.checked = 0 and p.passportNo = l.passportNo";
    //var qstr = "select p.passportNo,p.name from passenger p, luggage l where l.checked = 1 and p.passportNo = l.passportNo";
    con.query(qstr, function(err, result) {
      try{
        if(err) throw err;
        res.render('passenger_details', {passenger: result})
      }
      catch(err){
        console.log("ERROR");
      }
    })
  },
  penalty : function (req, res, con, session) {
    sess = req.session;
    var passport = sess.passport_user;
    var qstr1 = "select c.name, t.penalty from typeOfCrime t, crime_assign c where t.passportNo = '"+passport+"' and c.id = t.typeOfCrime";
    var qstr2 = "select name from passenger where passportNo = '"+passport+"'";
    var qstr3 = "select sum(t.penalty) as penalty from typeOfCrime t where t.passportNo = '"+passport+"'";
    var qstr4 = "select name from payment_type";
    var qstr5 = "select count(*) as count from typeOfCrime where passportNo = '"+passport+"'";
    con.query(qstr5, function (err, result5) {
      if(result5[0].count == 0){
        var qstr = "update luggage set checked = 1 where passportNo = '"+req.session.passport_user+"'";
        con.query(qstr, function(err, result) {
          try{
            if(err) throw err;
          }
          catch(err){
            console.log("ERROR");
          }
        });
        res.render('error', {passport : passport})
      }
      else{
            con.query(qstr1, function(err, result) {
      try{
        if(err) throw err;
        con.query(qstr2, function(err, result1) {
          con.query(qstr3, function (err, result2) {
            con.query(qstr4, function(err, result3) {
              console.log(result3);
                res.render('penalty', {crime : result, passenger : result1[0].name, sum : result2[0].penalty, link : "/action_payment", payment : result3})
            })
          })
        })
      }
      catch(err){
        console.log("ERROR");
      }
    })
  }
})
},

  crime : function (req,res, con, session) {
    sess = req.session;
    var passport = sess.passport_user;
    var officer = sess.officer;
    var qstr1 = "select city from airport where airportId = (select airportId from officer where officerId = '"+officer+"')";
    var qstr2 = "select crime_cash as cash, crime_gold as gold, crime_animal as animal from accused where passportNo = '"+passport+"'";
    con.query(qstr2, function (err, result1) {
      if(result1[0].cash ==1 || result1[0].gold ==1 || result1[0].animal ==1){
        con.query(qstr1, function (err, result2) {
          var city = result2[0].city;
          var qstr3 = "select area from police_station where city = '"+city+"'";
          con.query(qstr3, function (err, result3) {
            var qstr4 = "select name from passenger where passportNo = '"+passport+"'";
            con.query(qstr4, function (err, result4) {
              console.log(result3);
              res.render('criminal', {passenger : result4[0].name, cash : result1[0].cash, gold : result1[0].gold, animal : result1[0].animal, police_station : result3, link : '/action_criminal'})
            })
          })
        })
      }
      else {
        res.redirect('/correct_credentials_officer');
      }
    })
  },

  passenger : function (req, res, con) {
    var cash = req.body.cash;
    var gold = req.body.gold;
    var animal = req.body.animal;
    var check;
    var qstr1 = "select penalty, crime from animal where animalname = '"+animal+"'";
    var qstr2_a = "select penalty, crime from cash where value >= "+cash+" order by value limit 1";
    var qstr2_a_1 = "select count(*) as count from cash where value >= "+cash+" order by value limit 1";
    var qstr2_b = "select penalty, crime from cash where value < "+cash+" order by value desc limit 1";
    var qstr3_a = "select penalty, crime from gold where quantity >= "+gold+" order by quantity limit 1";
    var qstr3_b = "select penalty, crime from gold where quantity < "+gold+" order by quantity desc limit 1"
    con.query(qstr1, function (err1, result1) {
        con.query(qstr2_a_1, function (err, result) {
          console.log(result);
          if(result[0].count!=0){
            con.query(qstr2_a, function (err2, result2) {
            con.query(qstr3_a, function (err3, result3) {
            try{
              if(err3)  throw err3;
              if(result1[0].crime)
                check = 1;
              else
                check = 0;
              res.render('user', {passenger : req.body.pno, penalty_cash : result2[0].penalty, penalty_gold : result3[0].penalty, penalty_animal : result1[0].penalty, sum : result2[0].penalty+result3[0].penalty+result1[0].penalty, crime : check})
            }
            catch(err3){
              con.query(qstr3_b, function (err4, result4) {
                console.log(result2);
                console.log(result4);
                if(result1[0].crime)
                  check = 1;
                else
                  check = 0;
                res.render('user', {passenger : req.body.pno, penalty_cash : result2[0].penalty, penalty_gold : result4[0].penalty, penalty_animal : result1[0].penalty, sum : result2[0].penalty+result4[0].penalty+result1[0].penalty, crime : 1})
              })
            }
          })
      })
    }
        else{
          con.query(qstr2_b, function (err3, result3) {
              con.query(qstr3_a, function (err4, result4) {
                try{
                  if(err4)  throw err4;
                  res.render('user', {passenger : req.body.pno, penalty_cash : result3[0].penalty, penalty_gold : result4[0].penalty, penalty_animal : result1[0].penalty, sum : result3[0].penalty+result4[0].penalty+result1[0].penalty, crime : 1})
                }
                catch(err4){
                  con.query(qstr3_b, function (err5, result5) {
                    if(result5[0].crime||result1[0].crime||result3[0].crime)
                      check = 1;
                    else
                      check = 0;
                    res.render('user', {passenger : req.body.pno, penalty_cash : result3[0].penalty, penalty_gold : result5[0].penalty, penalty_animal : result1[0].penalty, sum : result3[0].penalty+result5[0].penalty+result1[0].penalty, crime : 1})
                  })
                }
              })
          })
        }
      })
    })
  }
}
