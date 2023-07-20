import { useEffect } from "react";
import "./lobby.css"
const Lobby =() =>{

    useEffect(() => {
        const form = document.getElementById("join-form");
    
        const handleSubmit = (e) => {
          e.preventDefault();
          let inviteCode = e.target.invite_link.value;
          window.location = `/second?room=${inviteCode}`;
        };
    
        form.addEventListener("submit", handleSubmit);
    
        // Cleanup the event listener when the component is unmounted
        return () => {
          form.removeEventListener("submit", handleSubmit);
        };
      }, []);
    return(
        <div className="lobbybody">
        <div className="lobbybody2">
          <main id="lobby-container">
                <div id="form-container">
                    <div id="form_container_header">
                        <p>👋Create OR Join a Room</p>
                    </div>
                    <div id="form_content_wrapper">
                    <form id="join-form">
            <input type="text" name="invite_link" required></input>
            <input type="submit" value="Join Room"></input>
        </form>  
                    </div>
                </div>
          </main>
          </div>
        </div>
        
    )
}
export default Lobby