var express = require('express');
var app = express();
var mysql = require('mysql');
var read = require('fs');
var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');
var auth = require('./auth.js');
var correct = false;
var session = require('express-session');
var insert = require('./insert');
var check = require('./check');
var penalty = require('./penalty');
var admin_works = require('./admin_works');
var print = require('./print');

app.use(session({
    secret: 'lollololol',
    resave: true,
    saveUninitialized: true
}));

var con = mysql.createConnection({
  host :'localhost',
  user : 'root',
  password : 'akh1997!',
  database : 'project'
});

var exphbs = require('express-handlebars');
var hbs = exphbs.create({defaultLayout : 'main'});
app.engine('handlebars',hbs.engine);
app.set('view engine','handlebars');

con.connect();

app.use(express.static('./views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res) {
  res.render('dropdown');
})

app.get('/max_penalty', function (req, res) {
  if(req.session.officer_password!=undefined){
    var qstr = "select passportNo, totalAmount from payment order by totalAmount desc limit 1";
    con.query(qstr, function (err, result) {
      res.render('max', {passportNo : result[0].passportNo, penalty : result[0].totalAmount});
    })
  }
  else {
    res.redirect('/officer')
  }
})

app.get('/admin',function(req,res) {
if(req.session.admin_user==undefined){
  res.render('form',{image: '/images/admin.png', whose : "Admin", link:"/action_admin"});
}
else {
  res.redirect('/correct_credentials_admin')
}
})

app.post('/action_admin',function (req,res) {
if(req.session.admin_user==undefined){
  auth.admin(req,res,con,session)
}
else {
  res.redirect('/correct_credentials_admin')
}
})

app.post('/action_officer',function (req,res) {
  if(req.session.admin_user==undefined){
  auth.officer(req,res,con,session)
}
else {
  res.redirect('/correct_credentials_officer')
}
})

app.get('/officer',function(req,res) {
  if(req.session.admin_user==undefined){
  res.render('form',{image:'',link:'/action_officer', whose : "Officer"});
}
else {
  res.redirect('/correct_credentials_officer')
}
})

app.get('/correct_credentials_officer', function(req,res){
  if(req.session.officer_password != undefined){
  console.log(req.session.officer);
  var qstr = "select o.name, a.city from officer o, airport a  where o.officerId = "+req.session.officer+" and o.airportId=a.airportId";
  con.query(qstr, function(err, result) {
    res.render('officer_home',{officer_name : result[0].name, city : result[0].city});

  })
}
else {
  res.redirect('/officer');
}
})

app.get('/correct_credentials_admin', function(req, res) {
  if(req.session.admin_password != undefined){
    var qstr = "select count(*) as no from request_officer";
    con.query(qstr, function (err, result) {
      res.render('admin_home', {admin_name : req.session.admin_user, count : result[0].no})
    })
  }
  else {
    res.redirect('/admin');
  }
})

app.get('/update_officer', function (req, res) {
  if(req.session.admin_password!= undefined){
    admin_works.update(req, res, con, session)
  }
  else {
    res.redirect('/admin');
  }
})

app.post('/action_delete_officer', function (req, res) {
  if(req.session.admin_password!= undefined){
    admin_works.delete(req, res, con, session)
  }
  else {
    res.redirect('/admin');
  }
})

app.get('/officer_details', function (req, res) {
    if(req.session.admin_password!= undefined){
      admin_works.view(req, res, con, session);
    }
    else {
      res.redirect('/admin')
    }
})

app.get('/update_request', function (req, res) {
  if(req.session.officer_password != undefined){
    admin_works.handle_request(req, res, con, session);
  }
  else{
    res.redirect('/officer');
  }
})

app.post('/action_officer_update', function (req, res) {
    if(req.session.officer_password != undefined){
      admin_works.officer_update(req, res, con, session);
    }
    else {
      res.redirect('/officer');
    }
})

app.get('/officer_transfer', function (req, res) {
  if(req.session.admin_password != undefined){
    admin_works.handle_transfer(req, res, con, session);
  }
  else {
    res.redirect('/admin');
  }
})

app.post('/action_transfer', function (req, res) {
  if(req.session.admin_password != undefined){
    var officerId = req.body.officerId;
    var decision = req.body.decision_officerId;
    console.log(req.body);
    if(req.body.decision == 1){
      var qstr1 = "select airportId from request_officer where officerId = "+req.body.officerId;
      con.query(qstr1, function (err, result1) {
        var qstr2 = "update officer set airportId = "+result1[0].airportId+" where officerId = "+officerId;
        con.query(qstr2);
      })
    }
    var qstr3 = "delete from request_officer where officerId = "+req.body.officerId;
    con.query(qstr3);
    res.redirect('/officer_transfer');
  }
  else {
    res.redirect('/admin');
  }
})

app.post('/action_admin_update',function (req, res) {
  if(req.session.admin_password!= undefined){
  var qstr1 = "select airportId from airport where city ='"+req.body.airport+"'";
  con.query(qstr1, function (err, result) {
    console.log(result);
    console.log(req.body.id);
    var airportId = result[0].airportId;
    var qstr2 = "insert into officer values("+req.body.id+",'"+req.body.name.toUpperCase()+"','"+req.body.passportNo.toUpperCase()+"',"+req.body.phoneNo+",'"+req.body.emailId+"',"+airportId+")";
    con.query(qstr2, function (err1, result1) {
      try{
        if(err1)  throw err1;
      }
      catch(err1){
        res.render('/admin_home', {tagline : "Incorrect Details", id : id, airport : result1, link : '/action_admin_update'})
      }
    });
    var qstr3 = "insert into authentication values("+req.body.id+",'"+req.body.emailId+"',"+req.body.phoneNo+")"
    con.query(qstr3);
  })
  res.redirect('/correct_credentials_admin')
}
else {
  res.redirect('/admin')
}
})

app.get('/update_passenger', function(req, res) {
  if(req.session.officer_password != undefined){
  res.render('passenger',{image: '',link: '/action_passenger_details'})
  }
  else{
    res.redirect('/officer')
  }
})

app.get('/update_luggage_details', function(req, res) {
  if(req.session.officer_password != undefined){
  var qstr = "select * from animal";
  con.query(qstr, function(err, result){
    console.log(result);
    res.render('luggage',{image: '',link: '/action_luggage_details',animal: result})
  })
  }
  else {
    res.redirect('/officer');
  }
})

app.post('/action_passenger_details', function(req, res){
  if(req.session.officer_password != undefined){
  insert.passenger(req, res, con, session);
}
else {
  res.redirect('/officer')
}
})

app.post('/action_luggage_details', function(req, res){
  if(req.session.officer_password != undefined){
  insert.luggage(req, res, con, session);
}
else {
  res.redirect('/officer');
}
})

app.get('/check_luggage$', function(req, res) {
  if(req.session.officer_password != undefined){
  check.luggage(req, res, con, session);
}
else {
  res.redirect('/officer')
}
})

app.get('/check_luggage/', function(req, res, next) {
if(req.session.officer_password != undefined){
  var adr = req.query.passenger;
  req.session.passport_user = adr;
  penalty.cash(req, res, con, session, adr)
  penalty.gold(req, res, con, session, adr)
  penalty.animal(req, res, con, session, adr)
  console.log(req.session.check);
  //var qstr = "update luggage set check = 1 where passportNo = '"+adr+"'";
  //con.query(qstr);
  next();
}
else {
  res.redirect('/officer')
}
}, function(req, res) {
  if(req.session.officer_password != undefined){
  res.redirect('/finish_check');
}
else {
  res.redirect('/officer')
}
})

app.get('/finish_check', function(req, res) {
if(req.session.officer_password != undefined){
  var qstr = "update luggage set checked = 1 where passportNo = '"+req.session.passport_user+"'";
  con.query(qstr, function(err, result) {
    try{
      if(err) throw err;
    }
    catch(err){
      console.log("ERROR");
    }
  });
  res.redirect('/penalty');
}
else {
  res.redirect('/officer');
}
})

app.get('/penalty', function(req, res) {
  if(req.session.officer_password != undefined){
  check.penalty(req, res, con, session);
}
else {
  res.redirect('/officer')
}
})

app.post('/action_payment', function(req, res) {
if(req.session.officer_password != undefined){
  var qstr1 = "select id from payment_type where name = '"+req.body.payment_type+"'";
  console.log(req.body.payment_type);
  con.query(qstr1, function (err, result1) {
    var pay = result1[0].id;
    var qstr2 = "select sum(penalty) as total from typeOfCrime where passportNo = '"+req.session.passport_user+"'";
    con.query(qstr2, function (err, result2) {
      var total = result2[0].total;
      var qstr3 = "insert into payment values('"+req.session.passport_user+"',"+total+","+pay+")";
      con.query(qstr3);
    })
  })
  res.redirect('/crime');
}
else {
  res.redirect('/officer')
}
})

app.get('/crime', function (req, res) {
if(req.session.officer_password != undefined){
  check.crime(req, res, con, session);
}
else {
  res.redirect('/officer')
}
})

app.post('/action_criminal', function(req, res) {
  if(req.session.officer_password != undefined){
  console.log(req.body);
  var qstr1 = "select id from police_station where area = '"+req.body.area_name+"'";
  con.query(qstr1, function (err, result1) {
    console.log(result1);
    var qstr2 = "insert into criminal_record values('"+req.session.passport_user+"',"+result1[0].id+")";
    con.query(qstr2);
  })
  res.redirect('/correct_credentials_officer')
}
else {
  res.redirect('/officer')
}
})

app.get('/criminal_details', function (req, res) {
if(req.session.officer_password != undefined){
  var qstr = "select a.name as name, p.pincode as pincode from criminal_record c, passenger a, police_station p where a.passportNo = c.passportNo and p.id = c.policeStaionId";
  con.query(qstr, function (err, result) {
    console.log(result);
    res.render('criminal_view', {criminal : result});
  })
}
else {
  res.redirect('/officer')
}
})

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
})

app.get('/passenger_info', function (req, res) {
  var qstr = "select * from animal";
  con.query(qstr, function(err, result){
    console.log(result);
    res.render('luggage',{extra: 1, image: '',link: '/action_passenger_info',animal: result})
  })
})

app.get('/info', function (req, res) {
  res.render('info');
})

app.post('/action_passenger_info', function (req, res) {
  check.passenger(req, res, con);
})

app.get('/payment_details$', function (req, res) {
if(req.session.officer_password != undefined){
    print.print_penalty(req, res, con, session);
}
else {
    res.redirect('/officer');
}
})

app.get('/payment_details/', function (req, res) {
  if(req.session.officer_password!=undefined){
    var adr = req.query.passenger;
    var qstr4 = "select name from passenger where passportNo = '"+adr+"'";
    var qstr1 = "select c.name, t.penalty from typeOfCrime t, crime_assign c where t.passportNo = '"+adr+"' and t.typeOfCrime = +c.id";
    var qstr2 = "select sum(penalty) as sum from typeOfCrime where passportNo = '"+adr+"'";
    var qstr3 = "select pt.name as payment from payment p, payment_type pt where p.passportNo = '"+adr+"'";
    con.query(qstr1, function (err, result1) {
      con.query(qstr2, function (err, result2) {
        con.query(qstr3, function (err, result3) {
          con.query(qstr4, function (err, result4) {
            console.log(result1);
            console.log(result2);
            console.log(result3);
            console.log(result4);
            res.render('print_final',{name : result4[0].name, passport : adr, sum : result2[0].sum, payment : result3[0].payment, penalty : result1})
          })
        })
      })
    })
  }
  else {
    res.redirect('/officer');
  }
})

app.listen(4000, function () {
  console.log('Example app listening on port 3000!')
})
