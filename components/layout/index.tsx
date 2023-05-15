import Head from "next/head";
import {Layout as LayoutAnt} from "antd";
import Link from "next/link";
import Image from "next/image";
import Account from "../Account";
import Background from "../background";
import useEagerConnect from "../../hooks/useEagerConnect";

const {Header, Footer, Sider, Content} = LayoutAnt;

export function Layout({children}) {
    const triedToEagerConnect = useEagerConnect();
    return (

        <div>
            <Head>
                <title> GoodMeme - Get Rich and Do Good</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <LayoutAnt className={"bg-none"}>

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
                </Header>
                <Content className="z-20 content-center items-center">
                    {children}

                </Content>

                <Background/>
            </LayoutAnt>

        </div>


    );
}
