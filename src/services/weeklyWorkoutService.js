import { ref, get, set, push } from 'firebase/database';
import { database } from '../config/firebase.config';
import { getWeekNumber, getDayKey } from '../utils/dateUtils';

// Obter status do treino para um dia específico
export const getWorkoutStatus = async (tokenKey, date = new Date()) => {
  const weekNumber = getWeekNumber(date);
  const dayKey = getDayKey(date);
  const statusRef = ref(database, `gymai_treino_semanal/${tokenKey}/semanas/${weekNumber}/${dayKey}`);
  const snapshot = await get(statusRef);
  if (snapshot.exists()) return snapshot.val();
  return { finalizado: false, finalizado_em: null };
};

// Finalizar treino do dia (registra log + marca semanal)
export const finalizarTreinoDoDia = async (tokenKey, workoutData, date = new Date()) => {
  const weekNumber = getWeekNumber(date);
  const dayKey = getDayKey(date);
  const hoje = new Date().toISOString().split('T')[0];

  // 1) Registrar no log diário
  const logRef = ref(database, `gymai_log/${tokenKey}/${hoje}`);
  const newLogRef = push(logRef);
  await set(newLogRef, {
    ...workoutData,
    timestamp: Date.now(),
    finalizado: true
  });

  // 2) Marcar como finalizado no controle semanal
  const statusRef = ref(database, `gymai_treino_semanal/${tokenKey}/semanas/${weekNumber}/${dayKey}`);
  await set(statusRef, {
    finalizado: true,
    finalizado_em: Date.now(),
    treino_id: newLogRef.key,
    volume_total: workoutData.volumeTotal || 0,
    duracao_minutos: workoutData.duracao || 0
  });

  // 3) Atualizar timestamp da última atualização
  const updateRef = ref(database, `gymai_treino_semanal/${tokenKey}/ultima_atualizacao`);
  await set(updateRef, Date.now());

  return { success: true, weekNumber, dayKey, logKey: newLogRef.key };
};

// Verificar se o treino de hoje já foi finalizado
export const isTreinoFinalizadoHoje = async (tokenKey) => {
  const status = await getWorkoutStatus(tokenKey, new Date());
  return status.finalizado === true;
};

// Obter todos os status da semana atual (retorna keys em english: monday...sunday)
export const getSemanaStatus = async (tokenKey, date = new Date()) => {
  const weekNumber = getWeekNumber(date);
  const semanasRef = ref(database, `gymai_treino_semanal/${tokenKey}/semanas/${weekNumber}`);
  const snapshot = await get(semanasRef);

  const diasSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const statusInicial = {};
  diasSemana.forEach(dia => {
    statusInicial[dia] = { finalizado: false, finalizado_em: null };
  });

  if (snapshot.exists()) {
    return { ...statusInicial, ...snapshot.val() };
  }
  return statusInicial;
};

// Limpar semanas antigas para economia de espaço (opcional)
export const limparSemanasAntigas = async (tokenKey, semanasManter = 4) => {
  const semanasRef = ref(database, `gymai_treino_semanal/${tokenKey}/semanas`);
  const snapshot = await get(semanasRef);
  if (!snapshot.exists()) return;
  const semanas = Object.keys(snapshot.val());
  semanas.sort();
  const semanaAtual = getWeekNumber(new Date());
  const indexSemanaAtual = semanas.indexOf(semanaAtual);
  if (indexSemanaAtual > semanasManter) {
    const semanasParaRemover = semanas.slice(0, indexSemanaAtual - semanasManter);
    for (const semana of semanasParaRemover) {
      const semanaRef = ref(database, `gymai_treino_semanal/${tokenKey}/semanas/${semana}`);
      await set(semanaRef, null);
    }
  }
};

// Verificar e registrar novo processamento semanal (reset natural por semana-node)
export const verificarResetSemanal = async (tokenKey) => {
  const semanaAtual = getWeekNumber(new Date());
  const ultimaAtualizacaoRef = ref(database, `gymai_treino_semanal/${tokenKey}/ultima_semana_processada`);
  const ultimaSnap = await get(ultimaAtualizacaoRef);
  const ultimaSemana = ultimaSnap.exists() ? ultimaSnap.val() : null;

  if (ultimaSemana !== semanaAtual) {
    await limparSemanasAntigas(tokenKey, 4);
    await set(ultimaAtualizacaoRef, semanaAtual);
    return true;
  }
  return false;
};

// Inicialização rápida (chamar ao montar página de treinos)
export const initializeWeeklyWorkouts = async (tokenKey) => {
  await verificarResetSemanal(tokenKey);
};
