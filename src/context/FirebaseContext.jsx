import { createContext, useContext } from 'react'
import { database, functions } from '@config/firebase.config'

const FirebaseContext = createContext()

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={{ database, functions }}>
      {children}
    </FirebaseContext.Provider>
  )
}
