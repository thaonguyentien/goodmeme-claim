import Image from "next/image"
import {useEffect, useState} from "react";
const Bubbles = () => {
    // const { width, pageHeight } = useDimensions();
    // if (!pageHeight || !width) return <></>;
    return (
        <>
            {Array.from({ length: 10 }, (_, idx) => idx).map((idx) => {
                const animationDelay = Math.random() * 10;
                const animationDuration = 6 / (Math.random()+1);
                const left = (idx+ Math.random())/10*100;
                return (
                    <Image
                        key={idx}
                        src="/gmtoken.png"
                        alt=""
                        width={834}
                        height={236}
                        className="bubble absolute w-14"
                        style={{
                            animationDelay: `${animationDelay}s`,
                            animationDuration: `${animationDuration}s`,
                            left: `${left}vh`,
                        }}
                    />
                );
            })}
        </>
    );
};

// const useDimensions = () => {
//     const [size, setSize] = useState<{
//         height: number;
//         width: number;
//         pageHeight: number;
//     }>({ height: 0, width: 0, pageHeight: 0 });
//
//     useEffect(() => {
//         function handleResize() {
//             const body = window.document.body,
//                 html = window.document.documentElement;
//
//             const pageHeight = Math.max(
//                 body.scrollHeight,
//                 body.offsetHeight,
//                 html.clientHeight,
//                 html.scrollHeight,
//                 html.offsetHeight,
//             );
//             setSize({
//                 width: window.innerWidth,
//                 height: window.innerHeight,
//                 pageHeight,
//             });
//         }
//         if (typeof window !== "undefined") {
//             handleResize();
//             window.addEventListener("resize", handleResize);
//             return window.removeEventListener("resize", handleResize);
//         }
//     }, []);
//
//     return size;
// };
export default Bubbles;
