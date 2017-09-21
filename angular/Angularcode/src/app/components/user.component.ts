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
      var temps=this;
      this.ws.onmessage = function(e: MessageEvent) {
          if(e.data=="Hello world"){
            console.log("sending token");
          temps.localstorage=window.localStorage;
          if(temps.localstorage.getItem("token")!='')
            {
              temps.ws.send(JSON.stringify({
                "type":"token",
                "token":temps.localstorage.getItem("token")
              }));
            }
          }

          try{
          var temp=JSON.parse(e.data);
          if(temp.type=='fetching')
            {
              temps.messages=[];
              if(!temps.to.get(temps.current_user))
                {
                  temps.to.set(temps.current_user,[]);
                }
            
                var tempmessage=temps.to.get(temps.current_user);

              for(i=0;i<temp.data.length;i++)
                {
                  var tempmsg=temp.data[i];

                  tempmessage.push({
                    "from":tempmsg.name,
                    "message":tempmsg.message,
                    "time":tempmsg.time
                  });
                  temps.messages.push({
                    "from":tempmsg.name,
                    "message":tempmsg.message,
                    "time":tempmsg.time  
                  });
                 }
                 temps.to.set(temps.current_user,tempmessage); 
                }



          else if(temp.type=='status')
            {
              if(temp.status='connected')
                {
                  temps.loggedin=true;
                }
                else{
                  temps.loggedin=false;
                }
            } 
            else if(temp.type==''){

            }
          
          else if(temp.type=='login')
             {
               if(temp.success)
                 {
                  temps.show=false;
                  temps.loggedin=true;
                  temps.name=temp.name;
                  for(var i=0;i<temp.connected_user.length;i++)
                    {  
                      console.log("connected users"+temp.connected_user[i]);
                      if(temps.name!=temp.connected_user[i])
                        temps.users.push(temp.connected_user[i]);
                    }
                  }
                  else
                    {
                      temps.error=temp.error;
                    }
             }
             else if(temp.type=='logout')
              {
                temps.show=true;
                temps.loggedin=false;
                temps.name="";
              }

          else if(temp.type=="tokenauthenticated")
            {
              if(temp.success)
                {
                  console.log("redirecting to home page");
                  temps.show=false;
                  temps.loggedin=true;
                  temps.name=temp.name;
                  for(var i=0;i<temp.connected_user.length;i++)
                    {  
                      if(temps.name!=temp.connected_user[i])
                        temps.users.push(temp.connected_user[i]);
                    }
                }
            }
          
          else if(temp.type=="grpcreated")
            {
              temps.Groups.push(
                {
                  name:temp.name,
                  members:temp.member,
                  messages:[]
                }
              );
            }

          else if(temp.type=="grpmessage")
            {
              if(temp.grp==temps.current_grp)
                {
                  temps.messages.push({
                    from:temp.form,
                    message:temp.message,
                    time:temp.time
                  });
                }
              for(var i=0;i<temps.Groups.length;i++)
                {
                  if(temps.Groups[i].name==temp.grp)
                    {
                      var tempmessages= temps.Groups[i].messages;
                      tempmessages.push({
                        from:temp.from,
                        message:temp.message,
                        time:temp.time
                      });
                      temps.Groups[i].messages=tempmessages;
                    }
                    break;
                }
            }

            else if(temp.type=="signup")
              {
                if(!temp.succees)
                  {
                    temps.error=temp.error;
                  }
              }

            else if(temp.type=="message")
              {
                if(!temps.to.get(temp.from))
                  {
                    this.to.set(this.from,[]);
                  }
                  var tempmessages=temps.to.get(temp.from);
                
                
                tempmessages.push({
                  "from":temp.from,
                  "message":temp.message,
                  "time":temp.time
                });
                if(temps.current_user==temp.from)
                temps.messages.push({
                  "from":temp.from,
                  "message":temp.message,
                  "time":temp.time
                });
                temps.to.set(temp.from,tempmessages);
              }

            else if(temp.type=="notification")
              {
                  if(temp.event=="new_user")
                    {
                      console.log("pushing"+ temp.new_connected);
                      temps.users.push(temp.new_connected);
                    }
                  else if(temp.event=="user_left")
                    {
                      temps.users.splice(temps.users.indexOf(temp.user),1);
                      if(temp.user==temps.current_user){
                        temps.messages.splice(0,temps.messages.length)
                      }
                      temps.current_user="";
                      temps.src="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png";
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
