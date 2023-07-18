
import './App.css';

function App() {
  let localStream; //for my
  let remoteStream; //for friends

  let init = async () =>{
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
    document.getElementById("user-1").srcObject = localStream //video tag has a property called srcObject
  }
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
