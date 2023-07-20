
import './secondpage.css';
import AgoraRTM from 'agora-rtm-sdk'
const SecondPage=()=> {

  let APP_ID = "c5db1eabdbb9431784306991c6fa6880"

  let token = null;
  let uid =String(Math.floor(Math.random()*1000)) 

  let client;
  let channel;

  let queryString = window.location.search             
  let urlParams = new URLSearchParams(queryString)
  let roomId=urlParams.get('room')

  if(!roomId){
    window.location="./Lobby"
  }
  /*eters of a URL. It takes the queryString as an argument, which is the value obtained from window.location.search.
urlParams.get('room'): The get() method of the URLSearchParams object is used to retrieve the value of a specific query parameter. In this case, it fetches the value associated with the key "room" in the query parameters.
The value of roomId will be the content of the "room" query parameter from the current URL. For example, if the current URL is https://example.com/second?room=12345, then roomId will be assigned the value "12345", assuming that the "room" query parameter is present in the URL.

This code is useful when you want to extract query parameters from the URL, especially in cases where you need to pass data or configuration to a specific page or component using query parameters.*/


  let localStream; //for my
  let remoteStream; //for friends
  let peerConnection;

  const servers = {
    iceServers: [
      {
        urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
      }
    ]
  }

  let constraints = {
    video:{
      width:{min:640,ideal:1920},
      height:{min:480,ideal:1080},
    },
    audio:true
  }

  let init = async () =>{
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({uid,token})

    channel = client.createChannel(roomId)//this will find a channel name main or create it
    await channel.join()// .join function of agora helps the peer to join the channel.

    channel.on('MemberJoined',handleUserJoined)//checks for other user on the channel{.on function does that}
    channel.on('MemberLeft',handleUserLeft)

    client.on('MessageFromPeer',handleMessageFromPeer)//it helps to start a function that will act as event listener of a message sent by the peer

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    document.getElementById("user-1").srcObject = localStream //video tag has a property called srcObject
    
  }

  let handleUserLeft=(MemberId)=>{
    document.getElementById('user-2').style.display="none";
    document.getElementById("user-1").classList.remove('smallFrame')
  }

  let handleMessageFromPeer = async(message,MemberId) =>{
    message = JSON.parse(message.text)
    console.log('message',message)
    if(message.type==='offer'){
      createAnswer(MemberId,message.offer)
    }
    if(message.type === 'answer'){
      addAnswer(message.answer)
    }
    if(message.type === 'candidate'){
        if(peerConnection){
          peerConnection.addIceCandidate(message.candidate)
        }
    }
  }
  
  let handleUserJoined = async(MemberId)=>{
    console.log("A new user joined the channel:", MemberId)
    createOffer(MemberId)
  }

  let createPeerConnection = async(MemberId) =>{
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById("user-2").srcObject = remoteStream
    document.getElementById("user-2").style.display="block"
    
    document.getElementById("user-1").classList.add('smallFrame')

    if(!localStream){ //fix for "on fast refresh error occur due to null value passed in video and audio as it takes time"
      localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
    document.getElementById("user-1").srcObject = localStream
    }

    localStream.getTracks().forEach((track)=>{
      peerConnection.addTrack(track,localStream) //this loops through all video and audio tracks so that remote peer can get them
    })

    peerConnection.ontrack = (event) =>{
      event.streams[0].getTracks().forEach((track)=>{
        remoteStream.addTrack(track)//this is event listner for remote stream
      })
    }

    peerConnection.onicecandidate = async (event) =>{//creating ice candidate
      if(event.candidate){
        client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberId) //sending ice candidate in console log
      }
    }

  }

  let createOffer = async (MemberId) =>{ //for creating offer by peer 1 which sends to peer 2
    await createPeerConnection(MemberId)
    let offer = await peerConnection.createOffer() //offer
    await peerConnection.setLocalDescription(offer) //answer
    client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberId) //This is a function of agora that sends a message to a peer and the peer message is sent is determined by MemberId
  }

  let createAnswer = async (MemberId,offer) =>{ //for creating answer for offer by peer 2 which sends to peer 1
    await createPeerConnection(MemberId)
    await peerConnection.setRemoteDescription(offer)
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)//answer
    client.sendMessageToPeer({text:JSON.stringify({'type':'answer','answer':answer})},MemberId) //Send message to peer 1
  }

  let addAnswer = async(answer) =>{
    if(!peerConnection.currentRemoteDescription){
      peerConnection.setRemoteDescription(answer)
    }
  }

  let leaveChannel = async() =>{
    await channel.leave()
    await client.logout()
  }

  let toggleCamera = async () =>{
    let videoTrack = localStream.getTracks().find(track=>track.kind === 'video')
    if(videoTrack.enabled){
      videoTrack.enabled = false
      document.getElementById('camera-btn').style.backgroundColor='rgb(255,80,80)'
    }else{
      videoTrack.enabled = true
      document.getElementById('camera-btn').style.backgroundColor='rgb(179,102,249,.9)'
    }
  }

  let toggleMic = async () =>{
    let audioTrack = localStream.getTracks().find(track=>track.kind === 'audio')
    if(audioTrack.enabled){
      audioTrack.enabled = false
      document.getElementById('mic-btn').style.backgroundColor='rgb(255,80,80)'
    }else{
      audioTrack.enabled = true
      document.getElementById('mic-btn').style.backgroundColor='rgb(179,102,249,.9)'
    }
  }

  window.addEventListener('beforeunload',leaveChannel)

  init()
  return (
    

    <div className="App">
      <div id='videos' >
      <video id="user-1" className="video-player" autoPlay playsInline></video>
      <video id="user-2" className="video-player" autoPlay playsInline></video>
      </div>

      <div id='controls'>
          <div className='control-container' id="camera-btn" onClick={toggleCamera}>
            <img src='images/camera.png'/>
          </div>
          <div className='control-container' id="mic-btn" onClick={toggleMic}>
            <img src='images/mic.png'/>
          </div>
          <a href='/'>
          <div className='control-container' id="leave-btn">
            <img src='images/phone.png'/>
          </div>
          </a>
      </div>

    </div>
  );
}

export default SecondPage;
