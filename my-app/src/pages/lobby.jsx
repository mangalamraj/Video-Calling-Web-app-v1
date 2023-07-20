import { useEffect } from "react";
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

        <form id="join-form">
            <input type="text" name="invite_link" required></input>
            <button type="submit" value="Join Room">Join Room</button>
        </form>
    )
}
export default Lobby