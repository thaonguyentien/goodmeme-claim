import {useWeb3React} from "@web3-react/core";
import {Space, Segmented, notification, Form, Spin, Input, Button, Col, Row, Statistic, Progress} from 'antd';
import {ReactNode, useEffect, useState} from "react";
import {Table, Divider, Modal, Result, Tag, Timeline} from 'antd';
import {ClockCircleOutlined} from '@ant-design/icons';
import Image from "next/image";

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
import Bubbles from "../components/bubbles"
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
                } else {
                    return {received: 0, isClaim: false}
                }
            }
        })


    useEffect(() => {
        const handle = async () => {
            if (chainId !== web3Config.chainID && library) {
                try {
                    // @ts-ignore
                    await library.provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{chainId: "0x" + web3Config.chainID.toString(16)}],
                    })
                } catch (e) {
                    // @ts-ignore
                    if (e.code == 4902) {
                        // @ts-ignore
                        await library.provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: "0x" + web3Config.chainID.toString(16),
                                    chainName: web3Config.bscChainName,
                                    rpcUrls: web3Config.bscRpcUrls,
                                    nativeCurrency: web3Config.bscNativeCurrency,
                                    blockExplorerUrls: web3Config.bscBlockExplorerUrls,
                                },
                            ],
                        })
                    }
                }
            }
        }
        handle()

    }, [chainId])

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
                className={" bg-gray-50 pb-2 mb-2 min-h-[500px] bg-cover rounded-lg shadow shadow-gray-600 w-5/6 md:w-1/2 mx-auto pt-5 mt-20  text-center"}>
                <div className={"font-bold text-3xl mt-4"}> You can claim $GM now!</div>
                {/*<div className={"mt-8 text-xl  mt-4"}><Link*/}
                {/*    href={"https://twitter.com/GoodMemeVIP/status/1657369642757939203"} target={"_blank"}*/}
                {/*    className={"underline"}>twitter.com/GoodMemeVIP/status/1657369642757939203</Link></div>*/}
                <p className={"mt-8 text-xl w-5/6 mx-auto"}>A total of 100,000,000 (1% total supply) $GM tokens a now
                    available to be
                    claimed by holder of $PEPE
                    token.</p>
                <p className={"mt-8 text-xl w-5/6 mx-auto "}>$GM tokens that have not been claimed within 7 days will be
                    burned.</p>
                 <ol className="relative mt-8 border-l-2 border-blue-500  w-3/4 lg:w-5/12 mx-auto ">
                    <li className="mb-10 ">
                        <div
                            className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <time
                            className="mb-1  font-normal leading-none text-gray-600 ">2023.05.08
                            09:00 (UTC+0)

                        </time>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start airdrop</h3>
                        <a rel={"noreferrer"} href="https://twitter.com/GoodMemeVIP/status/1657369642757939203"
                           target={"_blank"}
                           className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Learn
                            more <svg className="w-3 h-3 ml-2" fill="currentColor" viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                      clip-rule="evenodd"></path>
                            </svg></a>
                    </li>
                    <li className="mb-10 ">
                        <div
                            className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <time
                            className="mb-1  font-normal leading-none text-gray-600 dark:text-gray-500">2023.05.15
                            09:00 (UTC+0)
                        </time>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finish airdrop</h3>

                    </li>
                     <li className="mb-10 ">
                         <div
                             className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>

                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Burn $GM token</h3>

                     </li>

                </ol>



                {/*<p className={"mt-2 text-xl"}>2023.05.08 09:00 (UTC+0) - 2023.05.15 09:00 (UTC+0)</p>*/}

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
                                if(library){
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
                                }else {
                                    notification.error({message:"Please connect Metamask first"})
                                }

                            }}
                            disabled={data?.isClaim}
                            className={(data?.isClaim ? "opacity-50 cursor-not-allowed" : "hover:bg-white hover:text-blue-500 ") + "border-blue-500 bg-blue-500 text-white mx-auto mt-8  mb-2 flex h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}
                        >{loading ? <LoadingDots/> : "Claim"}
                        </button>
                    </div>

                }

            </div>
            <Bubbles />

        </Layout>


    );
}

export default Airdrop;
