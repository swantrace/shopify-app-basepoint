import { useContext } from "react";
import { createContext } from "react";

const AppGlobalContext = createContext<object | undefined>(undefined);

interface IProps {
  children: any;
}
export function AppWrapper({ children }: IProps) {
  return (
    <AppGlobalContext.Provider value={{}}>{children}</AppGlobalContext.Provider>
  );
}

export function useAppGlobalContext() {
  return useContext(AppGlobalContext);
}
