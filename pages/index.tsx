import {useWeb3React} from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import TokenBalance from "../components/TokenBalance";
import useEagerConnect from "../hooks/useEagerConnect";
import Background from "../components/background";
import Image from "next/image";
import {Layout, Space, Segmented, Form, Spin, Input, Button, Col, Row, Statistic, Progress} from 'antd';
import {useEffect, useState} from "react";
import {Table, Divider, notification, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {Web3Provider} from "@ethersproject/providers";
import useTokenBalance from "../hooks/useTokenBalance";
import useSWR from "swr";
import useTokenContract from "../hooks/useTokenContract";
import useRewardContract from "../hooks/useRewardContract";
import {abi as rewardAbi} from "../contracts/Reward.json"
import Web3 from "web3";
import {isHex} from "web3-utils";

const {Header, Footer, Sider, Content} = Layout;

const REWARD_ADDRESS = "0x98269F37AF328daf24d70AE253369d94736CFF65";
const {Countdown} = Statistic;

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


function Home() {
    const {account, library} = useWeb3React();

    const triedToEagerConnect = useEagerConnect();
    const [state, setState] = useState("request")
    const [historyRequest, setHistoryRequest] = useState([])
    const [txHash, setTxHash] = useState("")
    const [loadingRequest, setLoadingRequest] = useState(false)
    const [loadingClaim, setLoadingClaim] = useState(false)
    const [rewardData, setRewardData] = useState({
        percent: 0,
        claimable: 0,
        notClaim: 0,
        totalReward: 0,
        vestingEnd: 0,
        userReward: {}
    })
    useEffect(() => {
        const handle = async () => {
            if (library) {
                const web3 = new Web3(library.provider);
                // @ts-ignore
                const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
                let claimable = await contract.methods.claimable(account).call()
                let totalReward = await contract.methods.totalReward(account).call()
                let userReward = await contract.methods.userReward(account).call()
                let percent;
                if (userReward.vesting > 0) {
                    percent = (Date.now() / 1000 - parseInt(userReward.lastBlock)) / parseInt(userReward.vesting)
                } else {
                    percent = 0
                }

                console.log(percent)
                setRewardData({
                    percent: percent > 1 ? 100 : percent * 100,
                    claimable,
                    totalReward,
                    notClaim: userReward.payout,
                    vestingEnd: (parseInt(userReward.lastBlock) + parseInt(userReward.vesting)) * 1000,
                    userReward
                })
            }
        }
        handle()

    }, [library, account])

    useEffect(() => {
        const handle = async () => {
            if (account && library) {
                let res = await fetch("https://api-testnet.bscscan.com/api?module=logs&action=getLogs" +
                    "&address=" + REWARD_ADDRESS +
                    "&topic0=0x2213b00378693df3858f19dce6917fe8950ef26e9151de5f10cd4e07f4773475" +
                    "&topic0_1_opr=and" +
                    "&topic1=0x000000000000000000000000" + account.slice(2) +
                    "&apikey=YourApiKeyToken")
                let data = await res.json()
                if (res.status === 200) {

                    const data_: DataType[] = []
                    data.result.reverse().forEach((el, id) => {
                        // let date = new Date(parseInt(el.timeStamp))
                        data_.push({
                            key: id + 1,
                            time: (new Date(parseInt(el.timeStamp) * 1000)).toDateString(),
                            txHash: el.topics[2],
                            status: "pending",
                            contractIndex: parseInt(el.data)
                        })
                    })

                    const web3 = new Web3(library.provider);
                    // @ts-ignore
                    const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
                    let index = await contract.methods.index().call()
                    let listToCheckConfirm = []
                    data_.forEach((el, id) => {
                        if (el.contractIndex <= index) {
                            listToCheckConfirm.push({id, ...el})
                        }
                    })
                    let confirmResult = await contract.methods.isConfirmedTxHashBatch(listToCheckConfirm.map(el => el.txHash)).call()
                    confirmResult.forEach((el, id) => {
                        if (el) {
                            data_[listToCheckConfirm[id].id].status = "confirmed"
                        } else {
                            data_[listToCheckConfirm[id].id].status = 'rejected'
                        }
                    })
                    setHistoryRequest(data_)
                }
            }
        }

        handle()
    }, [account, library])


    const isConnected = typeof account === "string" && !!library;

    // const { data } = useTokenBalance(account, tokenAddress);

    return (

        <div>
            <Head>
                <title> GoodMeme - Get Rich and Do Good</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Layout>
                <Header className="flex z-20 " style={{backgroundColor: '#ececec', height: 64,}}>
                    <div className="flex items-center">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="GoodMeme logo"
                                // style={{paddingTop: "33px"}}
                                width={236}
                                height={236}

                                // width={834}
                                // height={236}
                                className="w-14"
                            />
                        </Link>
                    </div>
                    <Account triedToEagerConnect={triedToEagerConnect}/>
                    {/*</nav>*/}
                </Header>

                <Content className="z-20 content-center items-center">
                    <div className={"flex mt-5 mx-auto content-center"}>
                        <Segmented
                            className={"mx-auto"}
                            size={"large"}

                            options={[
                                {
                                    label: 'Request reward',
                                    value: 'request',
                                },
                                {
                                    label: 'Claim reward',
                                    value: 'claim',
                                },
                            ]}
                            onChange={(value) => {
                                // @ts-ignore
                                setState(value)
                            }
                            }
                        />
                    </div>

                    <div className={"rounded-lg shadow shadow-gray-600 w-3/4 mx-auto pt-5 mt-5 min-h-[500px]"}>
                        {
                            state === "request" ?
                                <div className={"text-center block"}>
                                    <div>
                                        <Input placeholder="Your txHash" className={"rounded-lg w-4/5"}
                                               onChange={e => {
                                                   // @ts-ignore
                                                   setTxHash(e.target.value)
                                               }}/>

                                    </div>
                                    <div className={"pt-5"}>
                                        <div style={{display: loadingRequest ? "" : "none"}}>
                                            <Spin>
                                                <div className="content"/>
                                            </Spin>
                                        </div>

                                        <Button style={{display: loadingRequest ? "none" : ""}} size={"large"}
                                                onClick={() => {
                                                    setLoadingRequest(true)
                                                    if (isHex(txHash) && txHash.length == 66) {
                                                        const web3 = new Web3(library.provider);
                                                        // @ts-ignore
                                                        const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
                                                        contract.methods.requestDiscount([txHash]).send({from: account})
                                                            .on('transactionHash', function (hash) {
                                                                console.log(hash)
                                                                notification.info({
                                                                    message: "Transaction Hash",
                                                                    description: <Link
                                                                        href={"https://testnet.bscscan.com/tx/" + hash}
                                                                        target={"_blank"}>{hash}</Link>
                                                                })
                                                            })
                                                            .on('confirmation', function (cfNumber) {
                                                                if (cfNumber === 1) {
                                                                    setLoadingRequest(false)
                                                                    // console.log(res)
                                                                    notification.success({
                                                                        message: "Transaction success",
                                                                    })
                                                                }

                                                            })
                                                            .on('error', function (error, receipt) {
                                                                setLoadingRequest(false)
                                                            });

                                                    } else {
                                                        notification.error({
                                                            message: 'Error',
                                                            description:
                                                                'Invalid txHash',
                                                        })
                                                        setLoadingRequest(false)
                                                    }
                                                }
                                                }>

                                            Submit</Button>
                                    </div>
                                    <Divider>Submitted history</Divider>
                                    <Table
                                        scroll={{x: "max-content"}}

                                        className={"mx-2"}
                                        columns={columns} dataSource={historyRequest} size="middle"
                                        pagination={{position: ["bottomCenter"]}}
                                    />
                                </div>
                                :
                                <div>
                                    <div className={"px-5 text-center"}>
                                        <Row gutter={16} className={"p-5"}>
                                            <Col span={12}>
                                                <Statistic className={"text-center"} title="All Claimed Token"
                                                           value={Math.floor(rewardData.totalReward / 10 ** 4) / 10 ** 14}/>
                                            </Col>
                                            <Col span={12}>
                                                {/*suffix={<Image className={"absolute top-6"} width={40}  height={40} alt={"coin"} src="/coin.png"/>}*/}
                                                <Statistic className={"text-center"} title="Claimable Token"
                                                           value={Math.floor(rewardData.claimable / 10 ** 4) / 10 ** 14}/>
                                            </Col>


                                        </Row>
                                        <Row gutter={16} className={"p-5"}>
                                            <Col span={12}>
                                                {/*suffix={<Image className={"absolute top-6"} width={40}  height={40} alt={"coin"} src="/coin.png"/>}*/}
                                                <Statistic className={"text-center"} title="Not claim token"
                                                           value={Math.floor(rewardData.notClaim / 10 ** 4) / 10 ** 14}/>
                                            </Col>
                                            <Col span={12}>
                                                <Statistic className={"text-center"} title="Full claim at"
                                                           value={rewardData.vestingEnd == 0 ? "_ _" : (new Date(rewardData.vestingEnd)).toLocaleString()}/>


                                            </Col>
                                        </Row>
                                        <Row gutter={16} className={"p-5"}>
                                            <Col span={24}>
                                                <div className={"text-center"}>
                                                    <p>Claim Progress</p>
                                                    <Progress className={"pt-2 w-4/5"}
                                                              type={"circle"}
                                                              percent={rewardData.percent}
                                                              strokeColor={{'0%': '#108ee9', '100%': '#87d068'}}/>
                                                </div>
                                            </Col>


                                        </Row>
                                        <div className={"pt-4"} style={{display: loadingClaim ? "" : "none"}}>
                                            <Spin>
                                                <div className="content"/>
                                            </Spin>
                                        </div>
                                        <Button
                                            style={{display: !loadingClaim ? "" : "none"}}
                                            size={"large"} disabled={rewardData.claimable == 0}
                                            onClick={() => {
                                                setLoadingClaim(true)

                                                const web3 = new Web3(library.provider);
                                                // @ts-ignore
                                                const contract = new web3.eth.Contract(rewardAbi, REWARD_ADDRESS);
                                                contract.methods.claim().send({from: account})
                                                    .on('transactionHash', function (hash) {
                                                        console.log(hash)
                                                        notification.info({
                                                            message: "Transaction Hash",
                                                            description: <Link
                                                                href={"https://testnet.bscscan.com/tx/" + hash}
                                                                target={"_blank"}>{hash}</Link>
                                                        })
                                                    })
                                                    .on('confirmation', function (cfNumber) {
                                                        if (cfNumber === 1) {
                                                            setLoadingClaim(false)
                                                            // console.log(res)
                                                            notification.success({
                                                                message: "Transaction success",
                                                            })
                                                        }

                                                    })
                                                    .on('error', function (error, receipt) {
                                                        setLoadingClaim(false)
                                                    });
                                            }}
                                        >Claim</Button>

                                    </div>

                                    {/*<p>Total claimed token: {rewardData.totalReward}</p>*/}
                                    {/*<p>Claimable: {rewardData.claimable}</p>*/}
                                    {/*<p>{rewardData.userReward.lastBlock}</p>*/}
                                    {/*<p>Not claim: {rewardData.notClaim}</p>*/}
                                    {/*<p>Full claim*/}
                                    {/*    in {rewardData.vestingEnd.toString()}</p>*/}

                                </div>
                        }

                    </div>

                </Content>
                <Background/>
                {/*<Footer style={footerStyle}>Footer</Footer>*/}
            </Layout>

            {/*<main style={{display: "flex"}}>*/}
            {/*    /!*<div>*!/*/}

            {/*        /!*<h1 style={{zIndex:20,position:'relative'}}>*!/*/}
            {/*        /!*    Welcome to{" "}*!/*/}
            {/*        /!*    <a href="https://github.com/mirshko/next-web3-boilerplate">*!/*/}
            {/*        /!*        next-web3-boilerplate*!/*/}
            {/*        /!*    </a>*!/*/}
            {/*        /!*</h1>*!/*/}

            {/*        /!*{isConnected && (*!/*/}
            {/*        /!*    <section>*!/*/}
            {/*        /!*        <ETHBalance/>*!/*/}

            {/*        /!*        <TokenBalance tokenAddress={DAI_TOKEN_ADDRESS} symbol="DAI"/>*!/*/}
            {/*        /!*    </section>*!/*/}
            {/*        /!*)}*!/*/}
            {/*    /!*</div>*!/*/}


            {/*</main>*/}

            {/*<style jsx>{`*/}
            {/*  nav {*/}
            {/*    display: flex;*/}
            {/*    justify-content: space-between;*/}
            {/*  }*/}

            {/*  main {*/}
            {/*    text-align: center;*/}
            {/*  }*/}
            {/*`}</style>*/}

        </div>


    );
}

export default Home;
