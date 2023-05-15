import {Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useState} from "react";
import {Modal} from "antd";

const LoadingTxModel = ({

                            loadingTxData,
                            setLoadingTxData,
                        }: {
    loadingTxData: { open: boolean, result?: ReactNode };
    setLoadingTxData: Dispatch<SetStateAction<{ open: boolean, result?: ReactNode }>>;
}) => {
    return (
        <Modal
            open={loadingTxData.open}
            footer={null}
            centered={true}
            onCancel={() => {
                setLoadingTxData({...loadingTxData, open: false})
            }
            }
        >
            {loadingTxData.result}
        </Modal>
    );
}

export function useLoadingTxModel() {
    const [loadingTxData, setLoadingTxData] = useState<{ open: boolean, result?: ReactNode }>({open: false})

    const LoadingTxModelCallback = useCallback(() => {
        return (

            <LoadingTxModel
                loadingTxData={loadingTxData}
                setLoadingTxData={setLoadingTxData}
            />
        );
    }, [loadingTxData, setLoadingTxData]);

    return useMemo(
        () => ({setLoadingTxData, LoadingTxModel: LoadingTxModelCallback}),
        [setLoadingTxData, LoadingTxModelCallback]
    );
}
