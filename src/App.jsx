import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { FirebaseProvider } from './context/FirebaseContext'
import AppRouter from './components/layout/AppRouter'

function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </FirebaseProvider>
  )
}

export default App
