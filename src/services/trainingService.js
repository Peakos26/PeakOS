import { ref, get } from 'firebase/database';
import { database } from '../config/firebase.config';
import { getProfile } from './profileService'; // ajuste se o serviço tiver outro caminho

export const getPlanoTreinoSemanal = async (tokenKey) => {
  try {
    const programaRef = ref(database, `gymai_programa/${tokenKey}`);
    const snapshot = await get(programaRef);
    if (snapshot.exists()) {
      return snapshot.val().dias || {};
    }

    const perfil = await getProfile(tokenKey);
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
