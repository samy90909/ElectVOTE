import { useContext, useEffect, useState } from "react";
import Navigation from "../../components/navigation/Navigation";
import PropTypes from "prop-types";
import { WalletContext } from "../../components/wallet/Wallet";
import "./ElectionCommision.css";
import { toast } from "react-hot-toast";

const ElectionCommision = ({ account }) => {
  const { contract } = useContext(WalletContext);
  const [winner, setWinner] = useState("No Winner");

  const dateToSeconds = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return Math.floor(date.getTime())
  }

  const startVoting = async (e) => {
    e.preventDefault()
    const startTime = new Date(document.querySelector("#start").value);
    const endTime = new Date(document.querySelector("#end").value);
    const startTimeSeconds = dateToSeconds(startTime) / 1000;
    const endTimeSeconds = dateToSeconds(endTime) / 1000;
    console.log(startTimeSeconds, endTimeSeconds)

    const time = {
      startTimeSeconds,
      endTimeSeconds
    }


    try {
      const res = await fetch("http://localhost:3000/api/time-bound", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(time)
      })
      const data = await res.json();
      if (data.message == "Voting Time Started") {

        await contract.methods.voteTime(startTimeSeconds, endTimeSeconds).send({ from: account, gas: 6000000 })
        toast.success("Voting Started")
      } else {
        toast.error("Time is greater than 24 hours")
      }
    } catch (error) {
      toast.error(error)

    }
  }





  useEffect(() => {
    const winnerInfo = async () => {
      const winner = await contract.methods.winner().call();
      if (winner === "0x0000000000000000000000000000000000000000") {
        setWinner("No winner");
      } else {
        setWinner(winner)
      }

    }
    contract && winnerInfo()
  }, [contract])

  const resultDeclare = async () => {
    await contract.methods.result().send({ from: account });
    alert("Result Declared")
  }
  const emergencyDeclared = async () => {
    await contract.methods.emergency().send({ from: account })
    alert("Emergency declared")
  }




  return (
    <>
      <div>
        <Navigation account={account} />
        <div className="election-wrapper">
          <h2>
            Winner is: {winner} <br />
          </h2>
          <form className="election-form" onSubmit={startVoting}>
            <label htmlFor="start">Start Time</label>
            <input type="datetime-local" id="start" required />

            <label htmlFor="end">End Time</label>
            <input type="datetime-local" id="end" required />

            <button className="regBtn" type="submit">
              Voting Start
            </button>
          </form>
        </div>
        <div className="admin-actions">
          <button className="emerBtn" onClick={emergencyDeclared}>
            Emergency
          </button>
          <button className="resultBtn" onClick={resultDeclare}>
            Result
          </button>
        </div>
      </div>
    </>
  );
};

ElectionCommision.propTypes = {
  account: PropTypes.node.isRequired,
};

export default ElectionCommision;
