const express = require('express')
const cors = require("cors")
const app = express()
const { Web3 } = require('web3')
const ABI = require("./ABI")

app.use(cors())
app.use(express.json())


const web3 = new Web3("HTTP://127.0.0.1:7545");
const contractAddress = "0xf9d72CC4caD30d2111De7cBFD54C7DB8eB498963";
//to create contract instance - abi and contract address
const contract = new web3.eth.Contract(ABI, contractAddress);


const genderVerification = (gender) => {
    const genderValue = gender.toLowerCase()
    if (genderValue === "male" || genderValue === "female" || genderValue === "others") {
        return true;
    }
    return false;
}

const partyClash = async (party) => {
    const candidateList = await contract.methods.candidateList().call()
    const exists = candidateList.some((candidate) => candidate.party.toLowerCase() === party.toLowerCase())
    return exists;
}

app.post("/api/time-bound", async (req, res) => {
    const { startTimeSeconds, endTimeSeconds } = req.body;
    if (endTimeSeconds - startTimeSeconds < 86400) {
        res.status(200).json({ message: "Voting Time Started" })
    } else {
        res.status(403).json({ message: "Time is greater than 24 hours" })
    }
})

app.post("/api/voter-verification", async (req, res) => {
    const { gender } = req.body;
    const genderStatus = genderVerification(gender);
    if (genderStatus === true) {
        res.status(200).json({ message: "Gender Valid" })
    } else {
        res.status(403).json({ message: "Gender Value invalid" })
    }
})

app.post("/api/candidate-verification", async (req, res) => {
    const { gender, party } = req.body;
    console.log(gender, party)
    const genderStatus = genderVerification(gender);
    const partyClashStatus = await partyClash(party);
    if (genderStatus === true) {
        if (partyClashStatus === false) {
            res.status(200).json({ message: "Gender and Party Are Valid" })
        } else {
            res.status(403).json({ message: "Either Party Name or Gender is not valid" })
        }
    } else {
        res.status(403).json({ message: "Gender Value invalid" })
    }
})


app.listen(3000, () => {
    console.log("Server is running at PORT 3000");
})