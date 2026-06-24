import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { WorkoutDayCard } from '../components/WorkoutDayCard';
import { getSemanaStatus, finalizarTreinoDoDia, initializeWeeklyWorkouts } from '../services/weeklyWorkoutService';
import { getPlanoTreinoSemanal } from '../services/trainingService';

export const WeeklyTrainingPage = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [treinosSemana, setTreinosSemana] = useState({});
  const [statusSemana, setStatusSemana] = useState({});
  const [loading, setLoading] = useState(true);
  const [semanaAtual] = useState(new Date());

  const diasDaSemana = [
    { key: 'segunda', nome: 'Segunda-feira' },
    { key: 'terca', nome: 'Terça-feira' },
    { key: 'quarta', nome: 'Quarta-feira' },
    { key: 'quinta', nome: 'Quinta-feira' },
    { key: 'sexta', nome: 'Sexta-feira' },
    { key: 'sabado', nome: 'Sábado' },
    { key: 'domingo', nome: 'Domingo' }
  ];

  const carregarDados = useCallback(async () => {
    if (!session?.tokenKey) return;
    setLoading(true);
    try {
      const plano = await getPlanoTreinoSemanal(session.tokenKey);
      setTreinosSemana(plano || {});
      const status = await getSemanaStatus(session.tokenKey, semanaAtual);
      setStatusSemana(status || {});
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      showToast('error', 'Erro ao carregar treinos da semana');
    } finally {
      setLoading(false);
    }
  }, [session, semanaAtual, showToast]);

  useEffect(() => {
    const init = async () => {
      if (!session?.tokenKey) return;
      await initializeWeeklyWorkouts(session.tokenKey);
      await carregarDados();
    };
    init();
  }, [session, carregarDados]);

  const handleFinalizarTreino = async (dadosTreino, diaKey) => {
    if (!session?.tokenKey) return;
    try {
      await finalizarTreinoDoDia(session.tokenKey, dadosTreino, new Date());
      await carregarDados();
      showToast('success', `🎉 Treino de ${diasDaSemana.find(d => d.key === diaKey)?.nome} finalizado!`);
    } catch (error) {
      showToast('error', 'Erro ao finalizar treino');
      throw error;
    }
  };

  const getDiaStatus = (diaKey) => {
    const hoje = new Date();
    const diaSemanaHoje = hoje.getDay();
    const mapaDiaNumero = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
    const diaNumero = mapaDiaNumero[diaKey];
    if (diaNumero === diaSemanaHoje) return 'today';
    if (diaNumero < diaSemanaHoje) return 'past';
    return 'future';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Treinos da Semana</h1>
        <p className="text-sm text-gray-500">Semana de {semanaAtual.toLocaleDateString()}</p>
      </div>

      <div className="space-y-4">
        {diasDaSemana.map(({ key, nome }) => {
          const treino = treinosSemana[key];
          const diaStatus = getDiaStatus(key);
          if (!treino) return null;
          return (
            <WorkoutDayCard
              key={key}
              dia={key}
              nomeDia={nome}
              treino={treino}
              isToday={diaStatus === 'today'}
              isPast={diaStatus === 'past'}
              onIniciarTreino={() => {}}
              onTreinoFinalizado={(dados) => handleFinalizarTreino(dados, key)}
            />
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold mb-2">Como funciona:</h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>✅ Treinos finalizados ficam verdes e bloqueados até a próxima semana</li>
          <li>🔴 Dias com "Hoje" indicam treino do dia atual</li>
          <li>⚠️ Dias em amarelo são treinos pendentes de dias anteriores</li>
          <li>⚪ Dias em cinza são treinos de dias futuros (aguarde a data)</li>
        </ul>
      </div>
    </div>
  );
};
