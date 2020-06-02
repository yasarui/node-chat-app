var socket = io();

//elements
const $messageForm = document.querySelector("#messageForm");
const $messageInput = $messageForm.querySelector("input");
const $messageButton = $messageForm.querySelector("button");
const $shareLocation = document.querySelector("#shareLocation");
const $messagesContainer = document.getElementById("messages-container");

//templates
const $messageTemplateSource = document.getElementById("message-template").innerHTML;
const $locationTemplateSource = document.getElementById("location-template").innerHTML;
const $sideBarTemplateSource = document.getElementById("sidebar-template").innerHTML;

//options
const { username,room } = Qs.parse(location.search,{ignoreQueryPrefix: true});

socket.on("message",({username,text,createdAt})=>{
    var template = Handlebars.compile($messageTemplateSource);;
    var html = template(
        {
            username,
            message:text,
            createdAt: moment(createdAt).format('h:mm a')
        }
    );
    $messagesContainer.insertAdjacentHTML('beforeend', html);
})

socket.on("locationMessage",({username,url,createdAt})=>{
    var template = Handlebars.compile($locationTemplateSource);;
    var html = template(
        {
            username,
            location:url,
            createdAt: moment(createdAt).format('h:mm a')
        }
    );
    $messagesContainer.insertAdjacentHTML('beforeend', html);
});

socket.on("roomData",({room,users})=>{
    var template = Handlebars.compile($sideBarTemplateSource);
    var html = template({
        room,
        users
    });
    document.getElementById("sidebar").innerHTML = html;
})

$messageForm.addEventListener("submit",(e)=>{
    $messageButton.setAttribute("disabled","disabled");
    const value = $messageInput.value;
    socket.emit("sendMessage",value,(err)=>{
        if(err){
           console.log(err);
        }
        $messageInput.value = "";
        $messageButton.removeAttribute("disabled");
        console.log("Message Delivered");
    });
    e.preventDefault();
});

$shareLocation.addEventListener("click",()=>{
   $shareLocation.setAttribute("disabled","disabled");
   if(!navigator.geolocation){
       return alert("Your browser doesnt support Geolocation");
   }
   navigator.geolocation.getCurrentPosition((position)=>{
      const location = { "latitude":position.coords.latitude,"longitude":position.coords.longitude};
      socket.emit("shareLocation",location,()=>{
          console.log("Location shared");
          $shareLocation.removeAttribute("disabled");
      });
   })
});

socket.emit('join',{ username,room},(error)=>{
    if(error){
        alert(error);
        location.href = "/";
    }
});