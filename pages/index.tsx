import {useWeb3React} from "@web3-react/core";
// import Head from "next/head";
// import Link from "next/link";
// import Account from "../components/Account";
// import useEagerConnect from "../hooks/useEagerConnect";
// import Background from "../components/background";
// import Image from "next/image";
// import {
//     Layout as LayoutAnt,
//     Space,
//     Segmented,
//     notification,
//     Form,
//     Spin,
//     Input,
//     Button,
//     Col,
//     Row,
//     Statistic,
//     Progress
// } from 'antd';
// import {ReactNode, useEffect, useState} from "react";
// import {Table, Divider, Modal, Result, Tag} from 'antd';
// import type {ColumnsType} from 'antd/es/table';
// import {abi as rewardAbi} from "../contracts/Reward.json"
// import Web3 from "web3";
// import {isHex} from "web3-utils";
//
// const {Header, Footer, Sider, Content} = LayoutAnt;
// import web3Config from "../contracts/config"
// import {useRouter} from "next/router";
// import {Layout} from "../components/layout";
//
// const REWARD_ADDRESS = web3Config.rewardAddress;
// const {Countdown} = Statistic;
//
// interface DataType {
//     key: React.Key;
//     contractIndex: number;
//     time: string;
//     txHash: string;
//     status: string;
// }
//
// const TagColors = {
//     "pending": "gray",
//     "rejected": "red",
//     "confirmed": "green"
// }
//
// const columns: ColumnsType<DataType> = [
//     {
//         title: 'Index',
//         dataIndex: 'key',
//     },
//     {
//         title: 'Time',
//         dataIndex: 'time',
//     },
//     {
//         title: 'TxHash',
//         dataIndex: 'txHash',
//     },
//     {
//         title: 'Status',
//         dataIndex: 'status',
//         render: (tag: string) => (
//             <span>
//
//
//                 <Tag color={TagColors[tag]} key={tag}>
//                     {tag.toUpperCase()}
//                 </Tag>
//
//       </span>
//         ),
//     },
// ];
//
//
// function Home() {
//     const {account, library, chainId} = useWeb3React();
//     const [loadingTxData, setLoadingTxData] = useState<{ open: boolean, result?: ReactNode }>({open: false})
//
//     const triedToEagerConnect = useEagerConnect();
//     const [state, setState] = useState("request")
//     const [historyRequest, setHistoryRequest] = useState([])
//     const [txHash, setTxHash] = useState("")
//     const [loadingRequest, setLoadingRequest] = useState(false)
//     const [loadingClaim, setLoadingClaim] = useState(false)
//     const [rewardData, setRewardData] = useState({
//         percent: 0,
//         claimable: 0,
//         notClaim: 0,
//         totalReward: 0,
//         vestingEnd: 0,
//         userReward: {}
//     })
//
//     const router = useRouter()
//     useEffect(() => {
//         const handle = async () => {
//             if (chainId !== web3Config.chainID && library) {
//                 try {
//                     // @ts-ignore
//                     await library.provider.request({
//                         method: 'wallet_switchEthereumChain',
//                         params: [{chainId: "0x" + web3Config.chainID.toString(16)}],
//                     })
//                 } catch (e) {
//                     // @ts-ignore
//                     if (e.code == 4902) {
//                         // @ts-ignore
//                         await context.library.provider.request({
//                             method: 'wallet_addEthereumChain',
//                             params: [
//                                 {
//                                     chainId: "0x" + web3Config.chainID.toString(16),
//                                     chainName: web3Config.bscChainName,
//                                     rpcUrls: web3Config.bscRpcUrls,
//                                     nativeCurrency: web3Config.bscNativeCurrency,
//                                     blockExplorerUrls: web3Config.bscBlockExplorerUrls,
//                                 },
//                             ],
//                         })
//                     }
//                 }
//             }
//         }
//         handle()
//
//     }, [chainId])
//     useEffect(() => {
//         const handle = async () => {
//             if (library && chainId === web3Config.chainID) {
//                 const web3 = new Web3(library.provider);
//                 // @ts-ignore
//                 const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
//                 let claimable = await contract.methods.claimable(account).call()
//                 let totalReward = await contract.methods.totalReward(account).call()
//                 let userReward = await contract.methods.userReward(account).call()
//                 let percent;
//                 if (userReward.vesting > 0) {
//                     percent = (Date.now() / 1000 - parseInt(userReward.lastBlock)) / parseInt(userReward.vesting)
//                 } else {
//                     percent = 0
//                 }
//
//                 setRewardData({
//                     percent: percent > 1 ? 100 : percent * 100,
//                     claimable,
//                     totalReward,
//                     notClaim: userReward.payout,
//                     vestingEnd: (parseInt(userReward.lastBlock) + parseInt(userReward.vesting)) * 1000,
//                     userReward
//                 })
//             }
//         }
//         handle()
//
//     }, [library, account, chainId])
//
//     useEffect(() => {
//         const handle = async () => {
//             if (account && library && web3Config.chainID === chainId) {
//                 let res = await fetch(web3Config.bscScanApi + "/api?module=logs&action=getLogs" +
//                     "&address=" + REWARD_ADDRESS +
//                     "&topic0=0x2213b00378693df3858f19dce6917fe8950ef26e9151de5f10cd4e07f4773475" +
//                     "&topic0_1_opr=and" +
//                     "&topic1=0x000000000000000000000000" + account.slice(2) +
//                     "&apikey=YourApiKeyToken")
//                 let data = await res.json()
//                 if (res.status === 200) {
//
//                     const data_: DataType[] = []
//                     data.result.reverse().forEach((el, id) => {
//                         // let date = new Date(parseInt(el.timeStamp))
//                         data_.push({
//                             key: id + 1,
//                             time: (new Date(parseInt(el.timeStamp) * 1000)).toDateString(),
//                             txHash: el.topics[2],
//                             status: "pending",
//                             contractIndex: parseInt(el.data)
//                         })
//                     })
//
//                     const web3 = new Web3(library.provider);
//                     // @ts-ignore
//                     const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
//                     let index = await contract.methods.index().call()
//                     let listToCheckConfirm = []
//                     data_.forEach((el, id) => {
//                         if (el.contractIndex <= index) {
//                             listToCheckConfirm.push({id, ...el})
//                         }
//                     })
//                     let confirmResult = await contract.methods.isConfirmedTxHashBatch(listToCheckConfirm.map(el => el.txHash)).call()
//                     confirmResult.forEach((el, id) => {
//                         if (el) {
//                             data_[listToCheckConfirm[id].id].status = "confirmed"
//                         } else {
//                             data_[listToCheckConfirm[id].id].status = 'rejected'
//                         }
//                     })
//                     setHistoryRequest(data_)
//                 }
//             }
//         }
//
//         handle()
//     }, [account, library, chainId])
//
//
//     const isConnected = typeof account === "string" && !!library;
//     return (
//         <Layout>
//             <div className={"flex mt-5 mx-auto content-center"}>
//                 <Segmented
//                     className={"mx-auto"}
//                     size={"large"}
//
//                     options={[
//                         {
//                             label: 'Request reward',
//                             value: 'request',
//                         },
//                         {
//                             label: 'Claim reward',
//                             value: 'claim',
//                         },
//                     ]}
//                     onChange={(value) => {
//                         // @ts-ignore
//                         setState(value)
//                     }
//                     }
//                 />
//             </div>
//
//             <div className={"rounded-lg shadow shadow-gray-600 w-3/4 mx-auto pt-5 my-5 min-h-[500px]"}>
//                 {
//                     state === "request" ?
//                         <div className={"text-center block"}>
//                             <div>
//                                 <Input placeholder="Your txHash" className={"rounded-lg w-4/5"}
//                                        onChange={e => {
//                                            // @ts-ignore
//                                            setTxHash(e.target.value)
//                                        }}/>
//
//                             </div>
//                             <div className={"pt-5"}>
//                                 <div style={{display: loadingRequest ? "" : "none"}}>
//                                     <Spin>
//                                         <div className="content"/>
//                                     </Spin>
//                                 </div>
//
//                                 <button
//                                     className={"w-32 mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10  items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}
//                                     style={{display: loadingRequest ? "none" : ""}}
//                                     onClick={() => {
//                                         setLoadingRequest(true)
//                                         if (isHex(txHash) && txHash.length == 66) {
//                                             const web3 = new Web3(library.provider);
//                                             // @ts-ignore
//                                             const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
//                                             contract.methods.requestDiscount([txHash]).send({from: account})
//                                                 .on('transactionHash', function (hash) {
//
//                                                     setLoadingTxData({
//                                                         open: true,
//                                                         result: <Result icon={<Spin/>}
//                                                                         title="Transaction is submitting"
//                                                                         extra={<button
//                                                                             className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
//                                                                             <Link
//                                                                                 href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + hash}
//                                                                                 target={"_blank"}>Transaction
//                                                                                 link</Link></button>}/>
//                                                     })
//                                                 })
//                                                 .on('receipt', function (receipt) {
//
//                                                     setLoadingTxData({
//                                                         open: true,
//                                                         result: <Result status="success"
//                                                                         title={"Transaction Successfully "}
//                                                                         extra={<button
//                                                                             className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
//                                                                             <Link
//                                                                                 href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + receipt.transactionHash}
//                                                                                 target={"_blank"}>Transaction
//                                                                                 link</Link></button>}/>
//                                                     })
//
//
//                                                 })
//                                                 .on('error', function (error, receipt) {
//                                                     setLoadingTxData({
//                                                         open: true,
//                                                         result: <Result status="error" title={"Error"}
//                                                                         subTitle={error.message}/>
//                                                     })
//                                                     // router.reload();
//                                                     setLoadingRequest(false)
//                                                 });
//
//                                         } else {
//                                             notification.error({
//                                                 message: 'Error',
//                                                 description:
//                                                     'Invalid txHash',
//                                             })
//                                             setLoadingRequest(false)
//                                         }
//                                     }
//                                     }>
//
//                                     Submit
//                                 </button>
//                             </div>
//                             <Divider>Submitted history</Divider>
//                             <Table
//                                 scroll={{x: "max-content"}}
//
//                                 className={"mx-2"}
//                                 columns={columns} dataSource={historyRequest} size="middle"
//                                 pagination={{position: ["bottomCenter"]}}
//                             />
//                         </div>
//                         :
//                         <div>
//                             <div className={"px-5 text-center"}>
//                                 <Row gutter={16} className={"p-5"}>
//                                     <Col span={12}>
//                                         <Statistic className={"text-center"} title="All Claimed Token"
//                                                    value={(Math.floor(rewardData.totalReward / 10 ** 4) / 10 ** 14).toFixed(3)}/>
//                                     </Col>
//                                     <Col span={12}>
//                                         {/*suffix={<Image className={"absolute top-6"} width={40}  height={40} alt={"coin"} src="/coin.png"/>}*/}
//                                         <Statistic className={"text-center"} title="Claimable Token"
//                                                    value={(Math.floor(rewardData.claimable / 10 ** 4) / 10 ** 14).toFixed(3)}/>
//                                     </Col>
//
//
//                                 </Row>
//                                 <Row gutter={16} className={"p-5"}>
//                                     <Col span={12}>
//                                         {/*suffix={<Image className={"absolute top-6"} width={40}  height={40} alt={"coin"} src="/coin.png"/>}*/}
//                                         <Statistic className={"text-center"} title="Not claim token"
//                                                    value={(Math.floor(rewardData.notClaim / 10 ** 4) / 10 ** 14).toFixed(3)}/>
//                                     </Col>
//                                     <Col span={12}>
//                                         <Statistic className={"text-center"} title="Full claim at"
//                                                    value={rewardData.vestingEnd == 0 ? "_ _" : (new Date(rewardData.vestingEnd)).toLocaleString()}/>
//
//
//                                     </Col>
//                                 </Row>
//                                 <Row gutter={16} className={"p-5"}>
//                                     <Col span={24}>
//                                         <div className={"text-center"}>
//                                             <p>Claim Progress</p>
//                                             <Progress className={"pt-2 w-4/5"}
//                                                       type={"circle"}
//                                                       percent={parseFloat(rewardData.percent.toFixed(3))}
//                                                       strokeColor={{'0%': '#108ee9', '100%': '#87d068'}}/>
//                                         </div>
//                                     </Col>
//
//
//                                 </Row>
//                                 <div className={"pt-4"} style={{display: loadingClaim ? "" : "none"}}>
//                                     <Spin>
//                                         <div className="content"/>
//                                     </Spin>
//                                 </div>
//                                 <button
//                                     className={"mx-auto mb-2  border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2 flex h-10 w-20 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}
//                                     style={{display: !loadingClaim ? "" : "none"}}
//                                     // size={"large"} disabled={rewardData.claimable == 0}
//                                     onClick={() => {
//                                         setLoadingClaim(true)
//
//                                         const web3 = new Web3(library.provider);
//                                         // @ts-ignore
//                                         const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
//                                         contract.methods.claim().send({from: account})
//                                             .on('transactionHash', function (hash) {
//                                                 setLoadingTxData({
//                                                     open: true,
//                                                     result: <Result icon={<Spin/>}
//                                                                     title="Transaction is submitting"
//                                                                     extra={<button
//                                                                         className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
//                                                                         <Link
//                                                                             href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + hash}
//                                                                             target={"_blank"}>Transaction
//                                                                             link</Link></button>}/>
//                                                 })
//                                             })
//                                             .on('receipt', function (receipt) {
//
//                                                 setLoadingTxData({
//                                                     open: true,
//                                                     result: <Result status="success"
//                                                                     title={"Transaction Successfully "}
//                                                                     extra={<button
//                                                                         className={"mx-auto border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500 mb-2  h-10 w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none"}>
//                                                                         <Link
//                                                                             href={web3Config.bscBlockExplorerUrls[0] + `/tx/` + receipt.transactionHash}
//                                                                             target={"_blank"}>Transaction
//                                                                             link</Link></button>}/>
//                                                 })
//
//
//                                             })
//                                             .on('error', function (error, receipt) {
//                                                 setLoadingTxData({
//                                                     open: true,
//                                                     result: <Result status="error" title={"Error"}
//                                                                     subTitle={error.message}/>
//                                                 })
//                                             });
//                                     }}
//                                 >Claim
//                                 </button>
//
//                             </div>
//
//                         </div>
//                 }
//
//             </div>
//
//         </Layout>
//
//     );
// }
//
// export default Home;
