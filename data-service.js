const Sequelize= require('sequelize');

var sequelize = new Sequelize("d2o33m6mom07ct", "rusfsbaafpekya", 
    "cf8ffad96524ebd748d5e3d69a83cf18e6c00dcf50fab57117b4b96628ec0ca2", {
    host: "ec2-50-19-109-120.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,   
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING

});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING

},{
    createdAt: false,
    updatedAt: false
});


module.exports.initialize =function (){
    return new Promise(function(resolve, reject){
       sequelize.sync().then(function(){
           resolve("The initialize is successful!");
       }).catch((err)=>{
            
           reject("unable to sync the database!");
       })
 
    });

};



module.exports.getAllEmployees = function(){
   
    return new Promise((resolve, reject)=>{
            console.log( "The element in the employees array is" + Employee.length );
            Employee.findAll().then(function(data){
                console.log("All employees read successfully.");
                resolve(data);
            }).catch((err)=>{           
                reject("There is some error during the read employees."+ err ); 
            });
           
    });
};


module.exports.getManagers= function(){
   
    return new Promise(function(resolve, reject){
        Employee.findAll().then().catch();
            reject("No result returned");
        
    });
};

module.exports.getDepartments= function(){
   
    return new Promise(function(resolve, reject){
        Department.findAll().then(data=>{
            resolve(data);
            console.log("The department data is return successfully1");
        }).catch((err)=>{

            reject('No results returned!');
        });
     
    });
};


module.exports.addEmployees = function( employeeData ){

    return new Promise(function(resolve, reject){
        employeeData.isManager =(employeeData.isManager) ? true : false;
        for(var prop in employeeData){
            if(employeeData[prop]=='')
                employeeData[prop] = null;
            
        }
        Employee.create(employeeData).then(()=>{
          
            resolve("Successfully created a new employee!");
        }).catch(err=>{
            console.log(err)
            reject("Failed to create a new employee!");
        });

    });
}

module.exports.getEmployeesByStatus=function(status){
    
    return new Promise(function(resolve, reject){
        Employee.findAll({where:{status: status}}).then(data=>{
            console.log("The find employees by status is successful.");
            resolve(data);
        }).catch((err)=>{
            reject("No result returned by the getbystatus function!");
        })    
      
    });
};

module.exports.getEmployeesByDepartment = function(department){

    return new Promise((resolve, reject)=>{
            Employee.findAll({where: {department: department}}).then(data=>{
                console.log("The getEmployeesByDepartment function return the correct data");
                resolve(data);
            }).catch(err=>{

                reject("No data returned1");
            });
        
    });
    
}

module.exports.getEmployeesByManager = function(manager){
    return new Promise((resolve, reject)=>{
            Employee.findAll({where:{employeeManagerNum: manager}}).then(data=>{
                console.log("getEmployeesByManager success!");
                resolve(data);
            }).catch(err=>{

                reject("No result returned!");
            });
       
    });
}

module.exports.getEmployeeByNum = function(num){
    
    return new Promise((resolve, reject)=>{
           Employee.findAll({ where: { employeeNum: num } }).then(data=>{
               console.log("getEmployeeByNum is succeed!");
               resolve(data[0]);  
           }).catch(err=>{

               reject("No result returned!");
           });         
    });
}

module.exports.updateEmployee= function(employeeData){
   
    return new Promise((resolve, reject)=>{
        employeeData.isManager=(employeeData.isManager)? true: false;
        for(const prop in employeeData){
            if(employeeData[prop]=="")
                employeeData[prop] = null;
            
        }
        Employee.update(employeeData, {where: {employeeNum: employeeData.employeeNum}}).then(()=>{
            // update the employeedaat
            resolve("Update the employee successfully!")
        }).catch(err=>{
            reject("Unable to update employee!");
        });
    });
}

module.exports.addDepartment= function(departmentData){
    return new Promise((resolve, reject)=>{
        for(var prop in departmentData){
            if(departmentData[prop]=="")
                departmentData[prop]=null;
        }
        Department.create(departmentData).then(()=>{
            resolve("The department is created successfully!" );
        }).catch(err=>{
            reject("Unable to create department.");
        });
    });
}
module.exports.updateDepartment = function(departmentData){
    return new Promise(function(resolve, reject){
        for(var prop in departmentData ){
            if(departmentData[prop]== '' ){
                departmentData[prop] = null;
            }
        }
        Department.update(departmentData, {
            where: { departmentId: departmentData.departmentId }
        }).then(()=>{
            resolve();
        }).catch((error)=>{
            reject("unable to update department"+ error);
        });
    });
};


module.exports.getDepartmentById= function(id){
   
    return new Promise(function(resolve, reject){
            Department.findAll({where: {departmentId: id}}).then(data=>{
                resolve(data[0]);
                console.log("Get department by id succeed!");
            }).catch((err)=>{             
                reject("some error in the getdepartmentbyid");
            });      
    });
};

module.exports.deleteEmployeeByNum= function(empNum){
    return new Promise(function(resolve, reject){
            Employee.destroy({where: { employeeNum: empNum } }).then(()=>{
                resolve();
            }).catch(err=>{
                reject("Unable to delete employee!");
            });
    });
};

