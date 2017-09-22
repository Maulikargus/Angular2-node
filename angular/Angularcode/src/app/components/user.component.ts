import { Component, OnInit } from '@angular/core';

@Component({
    moduleId:module.id,
  selector: 'user',
  templateUrl:'user.component.html',
})
 
export class UserComponent   { 
    register:boolean=false;
    login:boolean=true;
    ws:any;
    loginname:string;
    loginpassword:string;
    registername:string;
    registerpassword:string;
    show:boolean=true;
    loggedin:boolean=false;
    name:string="";
    error:string="";
    textmsg:string="";
    messages:Message[]=[];
    err:string="";
    users:string[]=[];
    grp:string[]=[];
    src:string="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png";
    popup:boolean=false;
    to:Map<string,Message[]>=new Map<string,Message[]>();
    current_user:string="";
    Groups:group[]=[];
    grpname:string="";
    current_grp="";
    localstorage:Storage;

    constructor() {
      this.ws = new WebSocket('ws://192.1.125.44:8080');
      var scope=this;
      this.ws.onmessage = function(e: MessageEvent) {
          if(e.data=="Hello world"){
            console.log("sending token");
          scope.localstorage=window.localStorage;
          if(scope.localstorage.getItem("token")!='')
            {
              scope.ws.send(JSON.stringify({
                "type":"token",
                "token":scope.localstorage.getItem("token")
              }));
            }
          }

          try{
          var received_data=JSON.parse(e.data);
          if(received_data.type=='fetching')
            {
              scope.messages=[];
              if(!scope.to.get(scope.current_user))
                {
                  scope.to.set(scope.current_user,[]);
                }
            
                var tempmessage=scope.to.get(scope.current_user);

              for(i=0;i<received_data.data.length;i++)
                {
                  var tempmsg=received_data.data[i];

                  tempmessage.push({
                    "from":tempmsg.name,
                    "message":tempmsg.message,
                    "time":tempmsg.time
                  });
                  scope.messages.push({
                    "from":tempmsg.name,
                    "message":tempmsg.message,
                    "time":tempmsg.time  
                  });
                 }
                 scope.to.set(scope.current_user,tempmessage); 
                }



          else if(received_data.type=='status')
            {
              if(received_data.status='connected')
                {
                  scope.loggedin=true;
                }
                else{
                  scope.loggedin=false;
                }
            } 
            else if(received_data.type==''){

            }
          
          else if(received_data.type=='login')
             {
               if(received_data.success)
                 {
                  scope.show=false;
                  scope.loggedin=true;
                  scope.name=received_data.name;
                  for(var i=0;i<received_data.connected_user.length;i++)
                    {  
                      console.log("connected users"+received_data.connected_user[i]);
                      if(scope.name!=received_data.connected_user[i])
                        scope.users.push(received_data.connected_user[i]);
                    }
                    scope.localstorage.setItem("token",scope.name);
                  }
                  else
                    {
                      scope.error=received_data.error;
                    }
             }
             else if(received_data.type=='logout')
              {
                scope.show=true;
                scope.loggedin=false;
                scope.name="";
              }

          else if(received_data.type=="tokenauthenticated")
            {
              if(received_data.success)
                {
                  console.log("redirecting to home page");
                  scope.show=false;
                  scope.loggedin=true;
                  scope.name=received_data.name;
                  for(var i=0;i<received_data.connected_user.length;i++)
                    {  
                      if(scope.name!=received_data.connected_user[i])
                        scope.users.push(received_data.connected_user[i]);
                    }
                }
            }
          
          else if(received_data.type=="grpcreated")
            {
              scope.Groups.push(
                {
                  name:received_data.name,
                  members:received_data.member,
                  messages:[]
                }
              );
            }

          else if(received_data.type=="grpmessage")
            {
              if(received_data.grp==scope.current_grp)
                {
                  scope.messages.push({
                    from:received_data.form,
                    message:received_data.message,
                    time:received_data.time
                  });
                }
              for(var i=0;i<scope.Groups.length;i++)
                {
                  if(scope.Groups[i].name==received_data.grp)
                    {
                      var tempmessages= scope.Groups[i].messages;
                      tempmessages.push({
                        from:received_data.from,
                        message:received_data.message,
                        time:received_data.time
                      });
                      scope.Groups[i].messages=tempmessages;
                    }
                    break;
                }
            }

            else if(received_data.type=="signup")
              {
                if(!received_data.succees)
                  {
                    scope.error=received_data.error;
                  }
              }

            else if(received_data.type=="message")
              {
                if(!scope.to.get(received_data.from))
                  {
                    this.to.set(this.from,[]);
                  }
                  var tempmessages=scope.to.get(received_data.from);
                
                
                tempmessages.push({
                  "from":received_data.from,
                  "message":received_data.message,
                  "time":received_data.time
                });
                if(scope.current_user==received_data.from)
                scope.messages.push({
                  "from":received_data.from,
                  "message":received_data.message,
                  "time":received_data.time
                });
                scope.to.set(received_data.from,tempmessages);
              }

            else if(received_data.type=="notification")
              {
                  if(received_data.event=="new_user")
                    {
                      console.log("pushing"+ received_data.new_connected);
                      scope.users.push(received_data.new_connected);
                    }
                  else if(received_data.event=="user_left")
                    {
                      scope.users.splice(scope.users.indexOf(received_data.user),1);
                      if(received_data.user==scope.current_user){
                        scope.messages.splice(0,scope.messages.length)
                      }
                      scope.current_user="";
                      scope.src="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png";
                    }
              }

            }catch(e)
            {


            }
        };
     }



    logout()
    {
      console.log("logout");
      this.ws.send(JSON.stringify({"type":"logout"}));

          this.users.splice(0,this.users.length+1);
          console.log("splicing");
    }

    loginfun(name:string,password:string)
    {
      console.log("login thava aavyu");
      var logindata={
        "type":"login",
        "name":name,
        "password":password
      }
        this.ws.send(JSON.stringify(logindata));
    }

    registerfun(name:string,password:string)
    {

      var logindata={
        "type":"signup",
        "name":name,
        "password":password
      }
        this.ws.send(JSON.stringify(logindata));
        this.toggle();
      }


      changeUser(name:string)
      {
        this.messages=[];
        this.current_user=name;
        this.current_grp="";
        this.src="https://i.imgur.com/DY6gND0.png";
        this.fetchMessages();
      }

      changeGrp(name:string)
      {
        this.messages=[];
        this.current_user="";
        this.src="http://millenniumholidays.com/images/client-group.png";
        this.current_grp=name;
        for(var i=0;i<this.Groups.length;i++)
          {
            if(this.Groups[i].name==name)
              {
                for(var j=0;j<this.Groups[i].messages.length;j++)
                  {
                    this.messages.push(this.Groups[i].messages[j]);
                  }
                  break;
              }
          }
      }


     toggle()
     {
       this.login=!this.login;
       this.register=!this.register;
     }


     fetchMessages()
     {
       console.log("call to thay che");
      if(this.current_user!="")
       this.ws.send(JSON.stringify({
         "type":"fetching",
         "name":this.current_user
       }));
     }


     popupcreategrp()
     {
        if(this.popup)
          this.popup=false;
        else
          this.popup=true;
        // this.loggedin=!this.loggedin;
      }


     onChange(user:string,isChecked:boolean)
     {
        if(isChecked)
          {
            this.grp.push(user);
          }
          else{
            this.grp.splice(this.grp.indexOf(user));
          }
     }

     createGrp()
     {
      console.log(this.Groups);
      if(this.grp.length>0)
        { 
          console.log("grpname"+this.grpname);
          if(this.grpname=="")
            {
              this.err="name must required";
            }
          else{
            this.grp.push(this.name);
            this.Groups.push({
            name:this.grpname,
            members:this.grp,
            messages:[]
            
          });
          this.ws.send(JSON.stringify({
            "type":"grpcreated",
            "members":this.grp,
            "grpname":this.grpname
          }));
          console.log("notified");
          this.err="";
          this.grpname="";
          this.grp=[];
          console.log(this.Groups);

          this.popupcreategrp();       
        }
        }
        
     }



     send(msg:string)
     {
       if(this.current_user!="")
        {
          console.log("sending messages to "+this.current_user);
          var abc={
            "type":"send",
            "to":this.current_user,
            "message":msg,
          }
         console.log(JSON.stringify(abc));
         this.ws.send(JSON.stringify(abc));
        if(!this.to.get(this.current_user))
          {
              this.to.set(this.current_user,[]);
          }
      var tempmessage=this.to.get(this.current_user);
      tempmessage.push({
        "from":this.name,
        "message":this.textmsg,
        "time":new Date().getHours()+":"+new Date().getMinutes()
      });

      this.messages.push({
        "from":this.name,
        "message":this.textmsg,
        "time":new Date().getHours()+":"+new Date().getMinutes()
      });
      this.to.set(this.current_user,tempmessage);
    }
    else{
      var member;
      for(var a in this.Groups){
        if(this.Groups[a].name==this.current_grp)
          {
            member=this.Groups[a].members;
            var message=this.Groups[a].messages;
            message.push({
            from:this.name,
            message:this.textmsg,
            time:new Date().getHours()+":"+new Date().getMinutes()
            });
            this.Groups[a].messages=message;  
            this.messages.push(
              {
                "from":this.name,
                "message":msg,
                "time":new Date().getHours()+":"+new Date().getMinutes()                
              }
            );
            break;
          }
      }



        this.ws.send(JSON.stringify({
          "message":msg,
          "togrp":this.current_grp,
          "type":"send",
          "member":member

        }))






    }
    
      this.textmsg="";

     }
    }

interface group{
  name:string;
  members:string[];
  messages:Message[];
}



interface Message{
  from:string;
  message:string;
  time:string;
}
