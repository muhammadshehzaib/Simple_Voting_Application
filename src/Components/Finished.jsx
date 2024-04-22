import React from "react";

const Finished = (props) => {
    return (
        <div className="login-container">
            <h1 className="welcome-message">Voting is Finished</h1>
            <h1>The Winner is  : {props.winnerName}</h1>
            <h1>Votes of the winner {props.winnerVotes}</h1>
        </div>
    )
}

export default Finished;