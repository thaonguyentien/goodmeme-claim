import {useWeb3React} from "@web3-react/core";
import {Space, Segmented, notification, Form, Spin, Input, Button, Col, Row, Statistic, Progress} from 'antd';
import {ReactNode, useEffect, useState} from "react";
import {Table, Divider, Modal, Result, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {abi as airdropAbi} from "../contracts/AirdropV1.json"
import Web3 from "web3";
import {useLoadingTxModel} from "../components/loading/loading-tx-model";
import Link from "next/link"

import web3Config from "../contracts/config"
import {useRouter} from "next/router";
import {Layout} from "../components/layout";
import useSWR from "swr";
import LoadingDots from "../components/shared/icons/loading-dots";


interface DataType {
    key: React.Key;
    contractIndex: number;
    time: string;
    txHash: string;
    status: string;
}

const TagColors = {
    "pending": "gray",
    "rejected": "red",
    "confirmed": "green"
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Index',
        dataIndex: 'key',
    },
    {
        title: 'Time',
        dataIndex: 'time',
    },
    {
        title: 'TxHash',
        dataIndex: 'txHash',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        render: (tag: string) => (
            <span>


                <Tag color={TagColors[tag]} key={tag}>
                    {tag.toUpperCase()}
                </Tag>

      </span>
        ),
    },
];


function Airdrop() {
    const {account, library, chainId} = useWeb3React();
    const [claimable, setClaimable] = useState<string>("0")
    const [loading, setLoading] = useState(false)
    const {LoadingTxModel, setLoadingTxData} = useLoadingTxModel();

    const {data, mutate} = useSWR(
        [library, account, chainId]
        , {
            fetcher: async ([library, account, chainId]) => {
                if (account && chainId == web3Config.chainID && library?.provider) {
                    const web3 = new Web3(library.provider);
                    //@ts-ignore
                    const contract = new web3.eth.Contract(airdropAbi, web3Config.airdropV1Address);
                    let received = await contract.methods.totalClaim(0).call();
                    received = parseFloat(web3.utils.fromWei(received, "ether"))
                    let isClaim = await contract.methods.isClaimed(account, 0).call();
                    console.log("user swr", received, isClaim)
                    return {received, isClaim}
                }
            }
        })


    useEffect(() => {
        const handler = async () => {
            if (account) {
                const res = await fetch("/api/claim?address=" + account)
                let data = await res.json()
                if (res.status === 200) {
                    if (data.reward !== null) {
                        const web3 = new Web3(library.provider);
                        setClaimable(web3.utils.fromWei(data.reward, "ether"))
                    } else {
                        setClaimable("")
                    }
                }

            }
        }
        handler()
    }, [account])
    return (

        <Layout>
            <LoadingTxModel/>
            <div
                className={"bg-gray-50 rounded-lg shadow shadow-gray-600 w-5/6 md:w-1/2 mx-auto pt-5 mt-20  text-center"}>
                <p className={"font-bold text-3xl mt-4"}> You can claim $GM now!</p>
                <p className={"mt-8 text-xl w-5/6 mx-auto"}>A total of 100,000,000 (1% total supply) $GM tokens a now available to be
                    claimed by holder of $PEPE
                    token.</p>
                <p className={"mt-8 text-xl w-5/6 mx-auto "}>$GM tokens that have not been claimed within 7 days will be burned.</p>
                <p className={"mt-2 text-xl"}>2023.05.08 09:00 (UTC+0) - 2023.05.15 09:00 (UTC+0)</p>

                <div className={"w-3/4 mt-8 mx-auto"}>
                    <div className={"flex"}>
                        <div><p>Received: {parseFloat(data?.received).toFixed(2)}</p></div>
                        <div className={"ml-auto mr-0"}><p>100,000,000</p></div>
                    </div>
                    <Progress percent={(data?.received || 0) / 100e6} strokeColor={{from: '#108ee9', to: '#87d068'}}
                              showInfo={false}></Progress>

                </div>
                {claimable === "" ?
                    <div className={"py-4"}>
                        <p>Forbidden</p>
                    </div>
                    :
                    <div className={"pb-2"}>
                        <p>Claimable: {claimable}</p>
                        <button
                            onClick={async () => {
                                setLoading(true)
                                const web3 = new Web3(library.provider);
                                const res = await fetch("/api/claim/proof?address=" + account);
                                const proof = await res.json();
                                //@ts-ignore
                                const contract = new web3.eth.Contract(airdropAbi, web3Config.airdropV1Address);
                                contract.methods.claim(0, proof, account.toLowerCase(), web3.utils.toWei(claimable, "ether")).send({from: account})
                                    .on('transactionHash', function (hash: string) {
                                        setLoadingTxData({
                                            open: true,
                                            result: <Result icon={<Spin size={"large"} className={"mt-6"}/>}
                                                            title={"Transaction is submitting"}
                                                            extra={
                                                                <button
                                                                    className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
                                                                    <Link
                                                                        href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + hash}
                                                                        target={"_blank"}>Transaction Link</Link>
                                                                </button>
                                                            }
                                            />
                                        })
                                    })
                                    .on('receipt', function (receipt: { transactionHash: string; }) {
                                        setLoadingTxData({
                                            open: true,
                                            result: <Result status="success" title={"Transaction Successfully"}
                                                            extra={
                                                                <button
                                                                    className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
                                                                    <Link
                                                                        href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + receipt.transactionHash}
                                                                        target={"_blank"}>Transaction Link</Link>
                                                                </button>
                                                            }/>
                                        })
                                        setLoading(false)
                                        mutate()
                                    })
                                    .on("error", (error: { code: number; message: any; }, receipt: any) => {
                                        setLoading(false)
                                        if (error.code === 4001) {
                                            setLoadingTxData({
                                                open: true,
                                                result: <Result status="error" title={"Error"}
                                                                subTitle={error.message}/>
                                            })
                                        }
                                        if (receipt) {
                                            setLoadingTxData({
                                                open: true,
                                                result: <Result status="error" title={"Error"}
                                                                subTitle={"Transaction has been reverted by the EVM"}
                                                                extra={
                                                                    <button
                                                                        className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
                                                                        <Link
                                                                            href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + receipt.transactionHash}
                                                                            target={"_blank"}>Transaction Link</Link>
                                                                    </button>
                                                                }
                                                />
                                            })
                                        }
                                    })
                            }}
                            disabled={data?.isClaim}
                            className={(data?.isClaim?"opacity-50 cursor-not-allowed":"hover:bg-white hover:text-blue-500 ")+ "border-blue-500 bg-blue-500 text-white mx-auto mt-8  mb-2 flex h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}
                        >{loading ? <LoadingDots/> : "Claim"}
                        </button>
                    </div>

                }

            </div>

        </Layout>


    );
}

export default Airdrop;
