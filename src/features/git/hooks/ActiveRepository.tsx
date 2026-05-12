import React, { createContext, useContext, useState } from "react";
import { ActiveRepositoryValue, Repository } from "../model/gitTypes";

export const ActiveRepositoryContext = createContext<ActiveRepositoryValue | null>(null);

export function ActiveRepositoryProvider({children} : {children : React.ReactNode}) {
    const [activeRepo,  setActiveRepo] = useState<Repository | null>(null);

    return (
        <ActiveRepositoryContext.Provider value={{activeRepo, setActiveRepo}}>
            {children}
        </ActiveRepositoryContext.Provider>
    )
}

export function useActiveRepo(){
    const context = useContext(ActiveRepositoryContext);

    if (!context) {
        throw new Error("useActiveRepo must be used inside ActiveRepositoryProvider");
    }

    return context;
} 