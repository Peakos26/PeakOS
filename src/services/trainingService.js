import { ref, get, set, push } from 'firebase/database';
import { database } from '../config/firebase.config';
import { profileService } from './profileService';
import { getWeekNumber, getDayKey } from '../utils/dateUtils';

export const trainingService = {
  async getCheckInsByWeek(tokenKey, weekKey) {
    try {
      const checkInsRef = ref(database, `gymai_dias_treino/${tokenKey}/${weekKey}`);
      const snapshot = await get(checkInsRef);
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: {} };
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
      return { success: false, error: error.message };
    }
  },

  async getWorkoutLogs(tokenKey) {
    try {
      const logsRef = ref(database, `gymai_log/${tokenKey}`);
      const snapshot = await get(logsRef);
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: {} };
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return { success: false, error: error.message };
    }
  },

  async getTrainingPlan(tokenKey) {
    try {
      const programaRef = ref(database, `gymai_programa/${tokenKey}`);
      const snapshot = await get(programaRef);
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      return { success: false, error: error.message };
    }
  },

  async getWorkouts(tokenKey) {
    try {
      const workoutsRef = ref(database, `gymai_treinos_ia/${tokenKey}`);
      const snapshot = await get(workoutsRef);
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: true, data: {} };
    } catch (error) {
      console.error('Erro ao buscar workouts:', error);
      return { success: false, error: error.message };
    }
  },

  async saveCheckInWithWeek(tokenKey, weekKey, day, location = null) {
    try {
      const checkInsRef = ref(database, `gymai_dias_treino/${tokenKey}/${weekKey}/${day}`);
      await set(checkInsRef, {
        day,
        timestamp: Date.now(),
        location: location ? { latitude: location.latitude, longitude: location.longitude } : null
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
      return { success: false, error: error.message };
    }
  }
};

export const getPlanoTreinoSemanal = async (tokenKey) => {
  try {
    const programaRef = ref(database, `gymai_programa/${tokenKey}`);
    const snapshot = await get(programaRef);
    if (snapshot.exists()) {
      return snapshot.val().dias || {};
    }

    const perfilResult = await profileService.getProfile(tokenKey);
    const perfil = perfilResult.data;
    const objetivo = perfil?.objetivo || 'massa';
    return gerarTreinoSemanalPorObjetivo(objetivo);
  } catch (err) {
    console.error('getPlanoTreinoSemanal erro:', err);
    return {};
  }
};

const gerarTreinoSemanalPorObjetivo = (objetivo) => {
  const treinosBase = {
    massa: {
      segunda: { nome: 'Peito e Tríceps', exercicios: ['Supino reto', 'Crucifixo', 'Tríceps corda'], duracao: 60 },
      terca: { nome: 'Costas e Bíceps', exercicios: ['Puxada frontal', 'Remada', 'Rosca direta'], duracao: 60 },
      quarta: { nome: 'Pernas', exercicios: ['Agachamento', 'Leg press', 'Cadeira extensora'], duracao: 60 },
      quinta: { nome: 'Ombro e Trapézio', exercicios: ['Desenvolvimento', 'Elevação lateral', 'Encolhimento'], duracao: 60 },
      sexta: { nome: 'Braços', exercicios: ['Rosca alternada', 'Tríceps testa', 'Martelo'], duracao: 60 }
    }
  };
  return treinosBase[objetivo] || treinosBase.massa;
};
