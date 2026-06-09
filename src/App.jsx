import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { FirebaseProvider } from './context/FirebaseContext'
import AppRouter from './components/layout/AppRouter'

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </AuthProvider>
    </FirebaseProvider>
  )
}

export default App
