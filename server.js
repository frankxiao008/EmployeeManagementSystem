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
const bodyParser = require("body-parser");
const path= require("path");
const dataService = require("./data-service.js");
const fs = require('fs');
const exphbs= require('express-handlebars');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {

    console.log("Express http server listening on "+ HTTP_PORT); 
    return new Promise(function(reslove, reject){
        dataService.initialize().then(function(value){
            console.log(value);
        }).catch(function(reason){
                console.log(reason);
            }); 
    });
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
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


app.get("/", function(req, res){
    res.render("home");
});

app.get("/about", function(req, res){
    res.render("about");
});



app.get("/employees", function(req, res){


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
app.get('/employee/:value', (req, res)=>{
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


app.get("/managers", function(req,res){
   
   dataService.getManagers().then(function(data){
        res.json(data);
   }).catch(function(err){
       res.json({message: err});
   });
 
 });


app.get("/departments", function(req,res){
    
    dataService.getDepartments().then(function(data){
       
        res.render("departments", (data.length >0 ) ? { departments: data } : { message: "No result!"});
    }).catch(function(err){
        res.render("departments", {message: "no results!"});
    }); 
});

app.get("/employees/add", function(req,res){
    dataService.getDepartments().then(data=>{
        res.render("addEmployee", {department: data })
    }).catch(err=>{
        res.render("addEmployee", {department: []});
    });
    
});

app.get("/images/add", function(req, res){
    res.render("addImage");
               
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb){
        cb(null, Date.now()+path.extname(file.originalname));
    }
});
const upload = multer({ storage:storage });

app.post("/images/add", upload.single("imageFile"), function(req, res){
    res.redirect('/images'); 
} );


 app.get("/images",  function(req, res){  
      
     fs.readdir("./public/images/uploaded", function(err, items){      
         res.render("images", {data:items});
    });

 });

 
app.post("/employees/add", function(req, res){
    dataService.addEmployees(req.body).then(()=>{
        res.redirect('/employees');
 
    }).catch(function(err){
        res.send("There is some error for the post  " +err);
   })
});

app.post("/employee/update", function(req, res){
    
    dataService.updateEmployee(req.body).then(()=>{
        res.redirect('/employees'); 
    }).catch((err)=>{
        res.send("There is some error "+ err);
    });
    
});

app.get("/departments/add", function(req, res){
    res.render('addDepartment');
});

app.post("/departments/add", function(req, res){ 
   dataService.addDepartment(req.body).then(()=>{
       res.redirect("/departments");
   }).catch(err=>{
       res.send("Unable to add the department.");
   });

}); 



app.get("/department/:departmentId", function(req, res){
    dataService.getDepartmentById(req.params.departmentId).then((data)=>{
        res.render("department", {data: data});
    }).catch(err=>{
        res.status(404).send("Department not found!");
    });
});

app.post("/department/update", function(req, res){
    
    dataService.updateDepartment(req.body).then(()=>{
       
        res.redirect("/departments");
    }).catch(error=>{
        res.status(500).send("Unable to update the department!" + error );
    });
});



app.get("/employees/delete/:empNum", function(req, res){
    dataService.deleteEmployeeByNum(req.params.empNum).then(()=>{
        res.redirect("/employees");
    }).catch(err=>{
        res.status(500).send("Unable to Remove Employee/Employee not found!");
    });
});

app.use(function(req, res){
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11!!!!!!!!!!");
});

app.listen(HTTP_PORT, onHttpStart);


