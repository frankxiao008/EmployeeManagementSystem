/********************************************************************************* 
 *  WEB322 – Assignment 05 * 
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
 * No part of this assignment has been copied manually or electronically from any other source  *
 *   (including 3rd party web sites) or distributed to other students. *  
 * *  Name: _____Saihong Xiao_____ Student ID: __140777178___ Date: _03/16/2019__ *
 *  *  Online (Heroku) Link: _______________ *
 *  ********************************************************************************/  
const express = require("express");
const multer = require("multer");
const clientSessions = require("client-sessions");
const bodyParser = require("body-parser");
const path= require("path");
const dataService = require("./data-service.js");
const fs = require('fs');
const exphbs= require('express-handlebars');
const dataServiceAuth = require("./data-service-auth.js");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(clientSessions({
    cookieName: "session",
    secret: "webassignment",
    duration: 3*60*1000,
    activeDuration: 2*60*1000
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(function(req,res,next){     
    let route = req.baseUrl + req.path;     
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");     
    next(); 
}); 
 
app.engine('.hbs', exphbs({ 
    extname: ".hbs",
    defaultLayout: "main",
    helpers:{
        navLink: function(url, options){     return '<li' +          
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +  
            '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
        },   
        equal:function(lvalue, rvalue, options){
            if(arguments.length <3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue){
                return options.inverse(this);
                
            }else{              
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

function ensureLogin(req, res, next){

    if(!req.session.user){
        res.redirect("/login");
    }else{
        next();
    }
}

app.get("/", function(req, res){
    res.render("home");
});

app.get("/about", function(req, res){
    res.render("about");
});


//ensureLogin,

app.get("/employees",  function(req, res){


   if(req.query.status ){
    dataService.getEmployeesByStatus(req.query.status).then((data)=>{   
    
           
            res.render("employees", (data.length >0 ) ? {employees: data} : {message: "no result for status  query of employees."});
     
         }).catch(function(err){
                res.render("employees", {message: err + "No result"});
            })
    }else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department).then(data=>{
            res.render("employees", {employees: data});
            
        }).catch(err=>{
            res.render({message: err});
        }) }else if(req.query.manager){
            dataService.getEmployeesByManager(req.query.manager).then(data=>{
                res.render("employees", {employees: data});
            }).catch(err=>{ res.render({message: err}); });

        }else{
            dataService.getAllEmployees().then((data)=>{              
                res.render("employees", (data.length >0) ? {employees:data} : {message: "No results!"});
            }).catch((err)=>{ res.render("employees", {message: "There is errors for getAllemployees!!" + err }); });
        } 
});
//ddddddddddddddddddddddddddddddddddddddddddddddddddddddd
app.get('/employee/:value', ensureLogin, (req, res)=>{
    let viewData ={};
    dataService.getEmployeeByNum(req.params.value).then(data=>{
        if(data){
            viewData.employee = data;
        }else{
            viewData.employee = null;
        }
        
    }).catch(
        (err)=>{
       viewData.employee = null;
      
    }).then(dataService.getDepartments)
    .then((data)=>{
        viewData.departments = data;
        for(let i=0; i<viewData.departments.length; i++){
            if(viewData.departments[i].departmentId == viewData.employee.department ){
                viewData.departments[i].selected = true;
            }
        }
    }).catch(()=>{
        viewData.departments=[];
    }).then(()=>{
        if(viewData.employee== null){
            res.status(404).send("Employee Not Found");
        }else{
            res.render("employee", { viewData: viewData });
        }
    }).catch(err=>{
        res.status(500).send("Unable to Show Employees");
    });
});


app.get("/managers", ensureLogin, function(req,res){
   
   dataService.getManagers().then(function(data){
        res.json(data);
   }).catch(function(err){
       res.json({message: err});
   });
 
 });


app.get("/departments", ensureLogin, function(req,res){
    
    dataService.getDepartments().then(function(data){
       
        res.render("departments", (data.length >0 ) ? { departments: data } : { message: "No result!"});
    }).catch(function(err){
        res.render("departments", {message: "no results!"});
    }); 
});


app.get("/employees/add", ensureLogin, function(req,res){
    dataService.getDepartments().then(data=>{
        res.render("addEmployee", {department: data })
    }).catch(err=>{
        res.render("addEmployee", {department: []});
    });
    
});

app.get("/images/add", ensureLogin, function(req, res){
    res.render("addImage");
               
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb){
        cb(null, Date.now()+path.extname(file.originalname));
    }
});
const upload = multer({ storage:storage });

app.post("/images/add", ensureLogin, upload.single("imageFile"), function(req, res){
    res.redirect('/images'); 
} );


 app.get("/images", ensureLogin, function(req, res){  
      
     fs.readdir("./public/images/uploaded", function(err, items){      
         res.render("images", {data:items});
    });

 });

 
app.post("/employees/add", ensureLogin, function(req, res){
    dataService.addEmployees(req.body).then(()=>{
        res.redirect('/employees');
 
    }).catch(function(err){
        res.send("There is some error for the post  " +err);
   })
});

app.post("/employee/update", ensureLogin, function(req, res){
    
    dataService.updateEmployee(req.body).then(()=>{
        res.redirect('/employees'); 
    }).catch((err)=>{
        res.send("There is some error "+ err);
    });
    
});

app.get("/departments/add", ensureLogin, function(req, res){
    res.render('addDepartment');
});

app.post("/departments/add", ensureLogin, function(req, res){ 
   dataService.addDepartment(req.body).then(()=>{
       res.redirect("/departments");
   }).catch(err=>{
       res.send("Unable to add the department.");
   });

}); 



app.get("/department/:departmentId", ensureLogin, function(req, res){
    dataService.getDepartmentById(req.params.departmentId).then((data)=>{
        res.render("department", {data: data});
    }).catch(err=>{
        res.status(404).send("Department not found!");
    });
});

app.post("/department/update", ensureLogin, function(req, res){
    
    dataService.updateDepartment(req.body).then(()=>{
       
        res.redirect("/departments");
    }).catch(error=>{
        res.status(500).send("Unable to update the department!" + error );
    });
});



app.get("/employees/delete/:empNum", ensureLogin, function(req, res){
    dataService.deleteEmployeeByNum(req.params.empNum).then(()=>{
        res.redirect("/employees");
    }).catch(err=>{
        res.status(500).send("Unable to Remove Employee/Employee not found!");
    });
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", function(req, res){
    dataServiceAuth.registerUser(req.body)
        .then(()=>{
            res.render("register", {successMessage: "User created"});
        }).catch((err)=>{
            res.render("register", { errorMessage: err, userName: req.body.userName  });
        });
});

app.post("/login", (req, res) => {

    req.body.userAgent = req.get('User-Agent');
  
    dataServiceAuth.checkUser(req.body).then((user) => {

    req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
    }

        res.redirect('/employees');
    }).catch((err) => {
      res.render("login", {errorMessage: err, userName: req.body.userName});
    });
  });
  




app.get("/logout", function(req, res){
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res)=>{
    res.render("userHistory");
});

app.use(function(req, res){
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11!!!!!!!!!!");
});



dataService.initialize()
      .then(dataServiceAuth.initialize)
      .then(function(mes){
          console.log(mes);
          app.listen(HTTP_PORT, function(){
              console.log("app listening on: " + HTTP_PORT);
          });
      }).catch(function(err){
          console.log("unable to start server: " + err);
      });
      


