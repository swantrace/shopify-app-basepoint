import { useContext, createContext } from 'react';

const AppGlobalContext = createContext<any>(null);

interface IProps {
  children: any;
}
export function AppWrapper({ children }: IProps): JSX.Element {
  return (
    <AppGlobalContext.Provider value={{}}>{children}</AppGlobalContext.Provider>
  );
}

export function useAppGlobalContext(): any {
  return useContext(AppGlobalContext);
}
