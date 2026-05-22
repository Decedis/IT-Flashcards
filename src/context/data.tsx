import { createContext, useContext } from 'react'
import type { AppData } from '../types'

export const DataCtx = createContext<AppData>({
  terms: [],
  modules: [],
  byId: {},
  moduleTopics: {},
})

export const useData = () => useContext(DataCtx)
