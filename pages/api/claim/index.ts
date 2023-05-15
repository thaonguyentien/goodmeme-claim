import {NextApiRequest, NextApiResponse} from "next";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import reward from "./reward.json"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const {address} = req.query as { address: string; };
        console.log(reward[address.toLowerCase()])
        const result = reward[address.toLowerCase()] || null
        res.status(200).json({reward: result})
    } else if (req.method === "OPTIONS") {
        res.status(200).send("OK");
    } else {
        res.status(405).json({error: "Method not allowed"});
    }
}
