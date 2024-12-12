import { createContext, useContext } from "react";
import { IExtraActions } from "./types";

// @ts-ignore
export const ExtraActionsContext = createContext<IExtraActions>();

export function useExtraActions(): IExtraActions {
  return useContext(ExtraActionsContext);
}
