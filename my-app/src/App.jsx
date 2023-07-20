
import './App.css';
import AgoraRTM from 'agora-rtm-sdk'
function App() {

  let APP_ID = "c5db1eabdbb9431784306991c6fa6880"

  let token = null;
  let uid =String(Math.floor(Math.random()*1000)) 

  let client;
  let channel;

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

  let init = async () =>{
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({uid,token})

    channel = client.createChannel('main')//this will find a channel name main or create it
    await channel.join()// .join function of agora helps the peer to join the channel.

    channel.on('MemberJoined',handleUserJoined)//checks for other user on the channel{.on function does that}
    channel.on('MemberLeft',handleUserLeft)

    client.on('MessageFromPeer',handleMessageFromPeer)//it helps to start a function that will act as event listener of a message sent by the peer

    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
    document.getElementById("user-1").srcObject = localStream //video tag has a property called srcObject
    
  }

  let handleUserLeft=(MemberId)=>{
    document.getElementById('user-2').style.display="none";
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
  window.addEventListener('beforeunload',leaveChannel)

  init()
  return (
    

    <div className="App">
      <div id='videos' >
      <video id="user-1" className="video-player" autoPlay playsInline></video>
      <video id="user-2" className="video-player" autoPlay playsInline></video>
      </div>

    </div>
  );
}

export default App;
