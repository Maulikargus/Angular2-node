var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var wss = new WebSocketServer({port: 8080}); 

var url = "mongodb://localhost:27017/nodedatabase";
var users = {};
var token={};
var connected_user_names=[];

wss.on('connection', function(connection) {
  
   console.log("User connected");
	
   connection.on('message', function(message) { 
      var data; 
      try {
         data = JSON.parse(message); 
      } catch (e) { 
      	 console.log();
         console.log("Invalid JSON"); 
         data = {}; 
      } 
		
      switch (data.type) {  

      	 case "signup":
      	 	console.log("signing up");
      	 	MongoClient.connect(url, function(err, db) {
 				if (err) throw err;
 				   db.collection("users").findOne({"name":data.name}, function(err, result) {
    			   if(result==null)
    			   {
    			   	
    			   	db.collection("users").insertOne({"name":data.name,"password":data.password}, function(err, res) {
    				if (err) throw err;
    				console.log("1 document inserted");
    				});
    			   	sendTo(connection, { 
                   	type: "signup", 
                   	success:"true",
                   	message:"successfully signed up" 
               	 }); 	
    			   }
    			   else{
    			   		console.log("username already exists")
    			 			sendTo(connection, { 
                   				type: "signup",
                   				success:false,
                   				error:"username already exists" 
    			   });
    			}
    			   db.close();
  					}); 


 			
      	 	});
      	 	break;


			
         case "login": 

         	MongoClient.connect(url, function(err, db) {
         		console.log("user trying to login");
 				if (err) throw err;
 				
  				 db.collection("users").findOne({"name":data.name}, function(err, result) {
    			   if(result==null)
    			   {	
    			   		console.log("User is not registered");
    			   	sendTo(connection, { 
                   	type: "login",
                   	success:false, 
                   	error:"register first" 
               	 });
               	 }
               	 else {
    			   		console.log(result);
    			   		if(result.password==data.password)
    			   		{
    					    users[data.name] = connection; 
             				connection.name = data.name; 
			   				connected_user_names.push(connection.name); 
               			
               				sendTo(connection, { 
                  				type: "login", 
                  				success: true ,
                  				name:data.name,
                  				connected_user:connected_user_names
               				}); 

			               for(name in connected_user_names)
          					 {
            					console.log("sending to"+connected_user_names[name]);
            					if(connected_user_names[name]!=connection.name){
            					var conn=users[connected_user_names[name]];
            					if(conn != null) {  
               						sendTo(conn, { 	
                  						type: "notification", 
                  						event:"new_user",
                  						new_connected:connection.name
            		   				}); 
            				}
            			} 
					}

    			   		}
    			   		else{
    			 			sendTo(connection, { 
                   				type: "login", 
                   				success:false,
                   				error:"incorrect password" 
    			   			});
    			   		}
    			   		}
    			   		 db.close();
    			   	});
    			   });
    			 

				break;


    			
				
         case "send": 
         
				var date = new Date();
            var current_hour = date.getHours();
            var current_time=date.getMinutes();
            var times=current_hour+":"+current_time;
            var name=data.to;
            var messagename="";
            if(name!=null)
            {	
            	if(name>connection.name)
            	{
            		messagename=connection.name+name;
            	}
            	else
            	{
            		messagename=name+connection.name;
            	}

            	MongoClient.connect(url, function(err, db) {
         		console.log("user trying to login");
 				if (err) throw err;
 				
  				 db.collection("messages").findOne({"_id":messagename}, function(err, result) {
    			   console.log(result);
    			   if(result==null)
    			   {	
    			   		db.collection("messages").insertOne({"_id":messagename,"messages":[]}, function(err, res) {
    				if (err) throw err;
    				console.log("1 document inserted");
    				});
    			   	
               	 }
               	 db.collection('messages').update({_id: messagename}, { $push: { 'messages': {'name':connection.name,'message':data.message,'time':times} } }, 
            		function(err, added) {
      			if( err || !added ) {
        			console.log("Track not added.");
      				}
      			else {
        			console.log("Track added to party with id: ");
            		var conn=users[name];
            		sendTo(conn,{
            			type:"message",
            			message:data.message,
            			from:connection.name,
            			time:times,
            			});
        			}
    			});
    			   		 db.close();
    			   	});
    			   });
    			 

            }

            else{ 
            	console.log(data);
            for(name in data.member)
           	{
            	console.log("sending to"+connected_user_names[name]);
            	if(connected_user_names[name]!=connection.name){
            	var conn=users[connected_user_names[name]];
            	if(conn != null) {  
               	sendTo(conn, { 	
                	  type: "grpmessage", 
                  	message: data.message,
                  	from:connection.name,
                  	time:times,
                  	grp:data.togrp
               	}); 
            	}
            	} 
			}
		}
		
            break;  
		

         case "grpcreated":
         console.log("grp created with"+data.members);
         for(var i=0;i<data.members.length;i++)
         {
         	var conn=users[data.members[i]];

         	if(connection!=conn)
         	{
         	sendTo(conn, { 	
                  				type: "grpcreated", 
                  				name:data.grpname,
                  				member:data.members
            		   		}); 
      		console.log("sending to"+data.members[i]);
         }
     }

         console.log("message sent");


         break;








         case "fetching":
         var name;
         if(data.name>connection.name)
         	name=connection.name+data.name;
         else
         	name=data.name+connection.name;
            	MongoClient.connect(url, function(err, db) {
         		console.log("user trying to login");
 				if (err) throw err;
 				
  				 db.collection("messages").findOne({"_id":name}, function(err, result) {
    			   console.log(result);
    			   	if(result!==null){
    			   	console.log(result.messages);
    			   	connection.send(JSON.stringify({
    			   		type:"fetching",
    			   		data:result.messages
    			   	}));
    			   	}
               	    	 db.close();
    			   	});
    			   });




         break; 



        
      }  
   });  
	
   connection.on("close", function() { 
	
      if(connection.name) { 
         connected_user_names.splice(connected_user_names.indexOf(connection.name),1);
   //   delete users[connection.name]; 
 
      }
      for(name in connected_user_names)
          		 {
            		console.log("sending to"+connected_user_names[name]);
            		if(connected_user_names[name]!=connection.name){
            			var conn=users[connected_user_names[name]];
            			if(conn != null) {  
               				sendTo(conn, { 	
                  				type: "notification", 
                  				event:"user_left",
                  				user:connection.name
            		   		}); 
            			}
            		} 
				} 
   });  
	if(connection.name)
	{
		connection.send(
		JSON.stringify(		{
					type:"status",
					status:"connected"
			}));
	}
	else{
		connection.send(JSON.stringify(
		{
					type:"status",
					status:"not connected"
		}
		)
		);
	}
   connection.send("Hello world"); 
	
});  

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}