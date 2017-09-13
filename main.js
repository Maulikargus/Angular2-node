var WebSocketServer = require('ws').Server;
 
var wss = new WebSocketServer({port: 8080}); 

var users = {};
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
			
         case "login": 
            console.log("User logged", data.name); 
			
			if(users[data.name]!="")	
            if(users[data.name]) { 
               sendTo(connection, { 
                  type: "login", 
                  success: false 
               }); 
            } else { 
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
				
            break; 
				
				
         case "send": 
         
         //   console.log("Sending message to: ", data.name);  
           
         //   var conn = users[data.name]; 
				var date = new Date();
            var current_hour = date.getHours();
            var current_time=date.getMinutes();
            var times=current_hour+":"+current_time;
           for(name in connected_user_names)
           {
            console.log("sending to"+connected_user_names[name]);
            if(connected_user_names[name]!=connection.name){
            var conn=users[connected_user_names[name]];
            if(conn != null) { 
               connection.otherName = data.name; 
               sendTo(conn, { 	
                  type: "message", 
                  message: data.message,
                  from:connection.name,
                  time:times
               }); 
            }
            } 
				}
            break;  
				
        
      }  
   });  
	
   connection.on("close", function() { 
	
      if(connection.name) { 
         connected_user_names.splice(connected_user_names.indexOf(connection.name),1);
      delete users[connection.name]; 
 
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
	
   connection.send("Hello world"); 
	
});  

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}