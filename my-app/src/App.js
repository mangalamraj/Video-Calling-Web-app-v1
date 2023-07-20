import React from "react";
import {Route,Routes} from "react-router-dom"
import SecondPage from "./pages/SecondPage";
import Lobby from "./pages/lobby";

const App = () =>{
    return(
        
    <Routes>
        <Route exact path="/" element={<Lobby/>}/>
        <Route exact path="/second" element={<SecondPage/>}/>
     </Routes>
            
            
        
    )
}
export default App;