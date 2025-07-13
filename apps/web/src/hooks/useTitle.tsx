import { useEffect } from "react";

const useTitle = (title: string, restoreOnUnmount: boolean = true) => {

    useEffect(() => {
        const prevTitle = document.title;
        document.title = title;
        if (restoreOnUnmount) {
            return (() => {
                document.title = prevTitle
            })
        }
    }, [title, restoreOnUnmount])


}

export default useTitle;