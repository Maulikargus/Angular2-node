import { Component } from '@angular/core';
@Component({
    moduleId:module.id,
  selector: 'user',
  templateUrl:'user.component.html'
})

export class UserComponent  { 
    ws:any;
    show:boolean=true;
    name:string="";
    textmsg:string="";
    messages:Message[]=[];
    users:string[]=[];
    constructor() {
      this.ws = new WebSocket('ws://192.1.125.44:8080');
      var temps=this;
      this.ws.onmessage = function(e: MessageEvent) {
          console.log("data aavyo"+e.data);
          try{
          var temp=JSON.parse(e.data);
           if(temp.type=='login')
             {
               if(temp.success)
                 {
                  temps.show=false;
                  temps.name=temp.name;
                  for(var i=0;i<temp.connected_user.length;i++)
                    {  
                      console.log(temp.connected_user[i]);
                      if(temps.name!=temp.connected_user[i])
                        temps.users.push(temp.connected_user[i]);
                    }
                  }
             }

            else if(temp.type=="message")
              {
                console.log(temp.message);
                temps.messages.push({
                  "from":temp.from,
                  "message":temp.message,
                  "time":temp.time
                });
              }

            else if(temp.type=="notification")
              {
                  if(temp.event=="new_user")
                    {
                      console.log("pushing"+ temp.new_connected);
                      temps.users.push(temp.new_connected);
                      console.log(temps.users); 
                    }
                  else if(temp.event=="user_left")
                    {
                      console.log("deleting user "+temp.user);
                      temps.users.splice(temps.users.indexOf(temp.user),1);
                    }
              }

            }catch(e)
            {
            }
        };
     }
    
     logIn(msg:string)
     {
       console.log("msg");
       var abc={
         "type":"login",
         "name":msg
       }
       console.log(JSON.stringify(abc));
       this.ws.send(JSON.stringify(abc));
     }

     send(msg:string)
     {
      var abc={
        "type":"send",
        "message":msg
      }
      console.log(JSON.stringify(abc));
      this.ws.send(JSON.stringify(abc));
      this.messages.push({
        "from":this.name,
        "message":this.textmsg,
        "time":new Date().getHours()+":"+new Date().getMinutes()
      });
      this.textmsg="";
     }
    }

interface Message{
  from:string;
  message:string;
  time:string;
}
