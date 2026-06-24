import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import Layout from './Layout'
import SessionMonitor from '@components/SessionMonitor'
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
import CommunityPage from '@pages/CommunityPage'
import AdminPage from '@pages/AdminPage'
import ExercisesLibraryPage from '@pages/ExercisesLibraryPage'
import WorkoutProgramsPage from '@pages/WorkoutProgramsPage'
import FoodDiaryPage from '@pages/FoodDiaryPage'
import HydrationPage from '@pages/HydrationPage'
import SleepPage from '@pages/SleepPage'
import RecoveryPage from '@pages/RecoveryPage'
import MindsetPage from '@pages/MindsetPage'
import FastingPage from '@pages/FastingPage'
import CardioPage from '@pages/CardioPage'
import BodyMeasurementsPage from '@pages/BodyMeasurementsPage'
import WorkoutGeneratorPage from '@pages/WorkoutGeneratorPage'
import WorkoutWizardPage from '@pages/WorkoutWizardPage'
import FoodAnalysisPage from '@pages/FoodAnalysisPage'
import WeeklyInsightsPage from '@pages/WeeklyInsightsPage'
import SmartGoalsPage from '@pages/SmartGoalsPage'
import AchievementsPage from '@pages/AchievementsPage'
import GamificationPage from '@pages/GamificationPage'
import EvolutionDashboardPage from '@pages/EvolutionDashboardPage'
import SupplementationPage from '@pages/SupplementationPage'
import IntegrationsPage from '@pages/IntegrationsPage'
import TaFeitoPage from '@pages/TaFeitoPage'
import CreatePersonalPasswordPage from '@pages/CreatePersonalPasswordPage'
import RecoverPersonalPasswordPage from '@pages/RecoverPersonalPasswordPage'
import { WeeklyTrainingPage } from '../../pages/WeeklyTrainingPage';

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
      <SessionMonitor />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-senha-pessoal" element={
          <ProtectedRoute>
            <CreatePersonalPasswordPage />
          </ProtectedRoute>
        } />
        <Route path="/recuperar-senha-pessoal" element={<RecoverPersonalPasswordPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/treinos" element={
          <ProtectedRoute>
            <Layout>
              <TrainingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/log-treino" element={
          <ProtectedRoute>
            <Layout>
              <WorkoutLogPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/exercicios" element={
          <ProtectedRoute>
            <Layout>
              <ExercisesLibraryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/programas" element={
          <ProtectedRoute>
            <Layout>
              <WorkoutProgramsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/diario-alimentar" element={
          <ProtectedRoute>
            <Layout>
              <FoodDiaryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/hidratacao" element={
          <ProtectedRoute>
            <Layout>
              <HydrationPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/sono" element={
          <ProtectedRoute>
            <Layout>
              <SleepPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/recuperacao" element={
          <ProtectedRoute>
            <Layout>
              <RecoveryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/mindset" element={
          <ProtectedRoute>
            <Layout>
              <MindsetPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/jejum" element={
          <ProtectedRoute>
            <Layout>
              <FastingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/cardio" element={
          <ProtectedRoute>
            <Layout>
              <CardioPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/medidas" element={
          <ProtectedRoute>
            <Layout>
              <BodyMeasurementsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/gerador-treino" element={
          <ProtectedRoute>
            <Layout>
              <WorkoutGeneratorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/wizard-treino" element={
          <ProtectedRoute>
            <Layout>
              <WorkoutWizardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analise-alimento" element={
          <ProtectedRoute>
            <Layout>
              <FoodAnalysisPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute>
            <Layout>
              <WeeklyInsightsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/metas-inteligentes" element={
          <ProtectedRoute>
            <Layout>
              <SmartGoalsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/conquistas" element={
          <ProtectedRoute>
            <Layout>
              <AchievementsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/gamificacao" element={
          <ProtectedRoute>
            <Layout>
              <GamificationPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard-evolucao" element={
          <ProtectedRoute>
            <Layout>
              <EvolutionDashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/suplementacao" element={
          <ProtectedRoute>
            <Layout>
              <SupplementationPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/integracoes" element={
          <ProtectedRoute>
            <Layout>
              <IntegrationsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/evolucao" element={
          <ProtectedRoute>
            <Layout>
              <EvolutionPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/ia" element={
          <ProtectedRoute>
            <Layout>
              <AIPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/features" element={
          <ProtectedRoute>
            <Layout>
              <FeaturesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/scanner" element={
          <ProtectedRoute>
            <Layout>
              <BodyScannerPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/coach-avancado" element={
          <ProtectedRoute>
            <Layout>
              <CoachAvancadoPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/comunidade" element={
          <ProtectedRoute>
            <Layout>
              <CommunityPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/ta-feito" element={
          <ProtectedRoute>
            <Layout>
              <TaFeitoPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/treinos/semana" element={<WeeklyTrainingPage />} />
</Routes>
    </BrowserRouter>
  )
}

export default AppRouter
