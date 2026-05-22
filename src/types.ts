export interface Module {
  id: string
  code: string
  name: string
  color: string
  progress: number
}

export interface Term {
  id: string
  term: string
  expand: string
  def: string
  module: string // moduleId
  topic: string
  related: string[]
}

export interface Stats {
  id: number
  streak: number
  correct: number
  wrong: number
  activity: number[]
}

export interface AppData {
  terms: Term[]
  modules: Module[]
  byId: Record<string, Term>
  moduleTopics: Record<string, string[]>
}

export type View = 'home' | 'modules' | 'dictionary' | 'practice'
export type PracticeMode = 't2d' | 'd2t' | 'mixed'
