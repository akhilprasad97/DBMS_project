var sess;

module.exports = {
  print_penalty : function (req, res, con, session) {
    sess = req.session;
    var qstr1 = "select p.name,p.passportNo from passenger p, payment p1 where p1.passportNo = p.passportNo order by p.name";
    con.query(qstr1, function (err, result) {
      console.log(result);
      res.render('print_penalty',{passenger : result})
    })
  }
}
