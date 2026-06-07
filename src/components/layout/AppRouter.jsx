import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import LoginPage from '@pages/LoginPage'
import HomePage from '@pages/HomePage'
import TrainingPage from '@pages/TrainingPage'
import WorkoutLogPage from '@pages/WorkoutLogPage'
import EvolutionPage from '@pages/EvolutionPage'
import AIPage from '@pages/AIPage'
import ProfilePage from '@pages/ProfilePage'
import FeaturesPage from '@pages/FeaturesPage'
import BodyScannerPage from '@pages/BodyScannerPage'
import CoachAvancadoPage from '@pages/CoachAvancadoPage'
import SocialSearchPage from '@pages/SocialSearchPage'
import AdminPage from '@pages/AdminPage'
import ExercisesLibraryPage from '@pages/ExercisesLibraryPage'
import WorkoutProgramsPage from '@pages/WorkoutProgramsPage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  return children
}

const AdminRoute = ({ children }) => {
  const { user, session, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }
  
  if (!user || session?.email !== 'heltonsales@icloud.com') {
    return <Navigate to="/" />
  }
  
  return children
}

const AppRouter = () => {
  return (
    <BrowserRouter basename="/PeakOS">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/treinos" element={
          <ProtectedRoute>
            <TrainingPage />
          </ProtectedRoute>
        } />
        <Route path="/log-treino" element={
          <ProtectedRoute>
            <WorkoutLogPage />
          </ProtectedRoute>
        } />
        <Route path="/exercicios" element={
          <ProtectedRoute>
            <ExercisesLibraryPage />
          </ProtectedRoute>
        } />
        <Route path="/programas" element={
          <ProtectedRoute>
            <WorkoutProgramsPage />
          </ProtectedRoute>
        } />
        <Route path="/evolucao" element={
          <ProtectedRoute>
            <EvolutionPage />
          </ProtectedRoute>
        } />
        <Route path="/ia" element={
          <ProtectedRoute>
            <AIPage />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/features" element={
          <ProtectedRoute>
            <FeaturesPage />
          </ProtectedRoute>
        } />
        <Route path="/scanner" element={
          <ProtectedRoute>
            <BodyScannerPage />
          </ProtectedRoute>
        } />
        <Route path="/coach-avancado" element={
          <ProtectedRoute>
            <CoachAvancadoPage />
          </ProtectedRoute>
        } />
        <Route path="/comunidade" element={
          <ProtectedRoute>
            <SocialSearchPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
