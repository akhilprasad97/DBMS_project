var sess;

module.exports = {
  update : function (req, res, con, session) {
    var qstr1 = "select city from airport";
    var qstr2 = "select officerId from officer order by officerId desc limit 1";
    con.query(qstr1, function (err, result1) {
      con.query(qstr2, function (err1, result2) {
        try{
          if(err1) throw err1;
          var id = result2[0].officerId+1;
          res.render('admin_update', {id : id, airport : result1, link : '/action_admin_update'})
        }
        catch(err1){
          res.render('admin_update', {id : 100 , airport : result1, link : '/action_admin_update'})
        }
      })
    })
  },
  view : function (req, res, con, session) {
    var qstr = "select officerId, name, passportNo, airportId from officer";
    con.query(qstr, function (err, result) {
      res.render('officer_view', {officer : result, link : '/action_delete_officer'})
    })
  },
  delete : function (req, res, con, session) {
    var i;
    console.log(req.body.delete[0].length);
    if(req.body.delete[0].length!=3){
      var qstr = "delete from officer where officerId = "+req.body.delete;
      con.query(qstr);
    }
    else{
      for(i=0;req.body.delete[i]!=undefined;i++){
        var qstr = "delete from officer where officerId = "+req.body.delete[i];
        console.log("hello");
        con.query(qstr);
      }
    }
    console.log(req.body.delete[0]);
    res.redirect('/admin');
  },
  handle_request : function (req, res, con, session) {
    sess = req.session;
    var qstr = "select city from airport a, officer o where o.officerId = "+sess.officer+" and o.airportId != a.airportId";
    con.query(qstr, function (err, result) {
      res.render('officer_update', {link : '/action_officer_update', airport : result});
    })
  },
  officer_update : function (req, res, con, session) {
    sess = req.session;
    console.log(req.body.airport+"hello");
    var qstr1 = "update officer set emailId = '"+req.body.emailId+"' where officerId = "+sess.officer;
    var qstr2 = "update officer set phoneNo = "+req.body.phoneNo+" where officerId = "+sess.officer;
    var qstr3 = "select airportId as id from airport where city = '"+req.body.airport+"'";
    if(req.body.emailIdcb == 1)
      con.query(qstr1);
    if(req.body.phoneNocb == 1)
      con.query(qstr2);
    if(req.body.airportcb == 1){
      con.query(qstr3, function (err, result) {
        var qstr4 = "insert into request_officer values("+sess.officer+", "+result[0].id+")";
        con.query(qstr4, function (err, result5) {
          try{
            if(err) throw err;
          }
          catch(err){
            var qstr4 = "update request_officer set airportId = "+result[0].id+" where officerId = "+sess.officer;
            con.query(qstr4);
            }
          });
        });
      }
    res.redirect('/correct_credentials_officer');
  },
  handle_transfer : function (req, res, con, session) {
    sess = req.session;
    var qstr = "select a.city, o.officerId, o.name from airport a, officer o, request_officer r where o.officerId = r.officerId and a.airportId = r.airportId";
    con.query(qstr, function (err, result) {
      res.render('update_request', {request : result});
    })
  }
}
