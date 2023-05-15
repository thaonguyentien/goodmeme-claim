import {NextApiRequest, NextApiResponse} from "next";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import reward from "./reward.json"
import fs from "fs";
import treeData from "./tree.json"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const {address} = req.query as { address: string; };
        // @ts-ignore
        let tree = StandardMerkleTree.load(treeData);
        let proof;
        // @ts-ignore
        for (const [i, v] of tree.entries()) {
            if (v[0].toLowerCase() === address.toLowerCase()) {
                proof = tree.getProof(i);
                break
            }
        }
        res.status(200).json(proof);
    } else if (req.method === "POST") {
        const leaves = Object.entries(reward).map(el => [el[0], el[1]])
        const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
        fs.writeFileSync("./pages/api/claim/tree.json", JSON.stringify(tree.dump()));
        res.status(200).json({root: tree.root});
    } else if (req.method === "OPTIONS") {
        res.status(200).send("OK");
    } else {
        res.status(405).json({error: "Method not allowed"});
    }
}
