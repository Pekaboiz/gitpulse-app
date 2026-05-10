import { createContext, useContext, useMemo, useState } from "react";
import { LoadingContextValue, LoadingKey } from "../model/gitTypes";

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({children} : {children : React.ReactNode}){
    const [loading, setLoadingState] = useState<Partial<Record<LoadingKey, boolean>>>({});

    function setLoading (key : LoadingKey, value : boolean) {
        setLoadingState((prev) => ({...prev, [key]: value}))
    }

    const value = useMemo<LoadingContextValue>(() => {
        return {
            loading,
            setLoading,
            isLoading : (key) => Boolean(loading[key]),
            isAnyLoading : Object.values(loading).some(Boolean),
        }
    }, [loading]);

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error("useLoading must be used inside ActiveTabProvider");
    }

    return context;
} 