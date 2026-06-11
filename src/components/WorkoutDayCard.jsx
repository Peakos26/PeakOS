import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { getWorkoutStatus } from '../services/weeklyWorkoutService';
import { CheckCircle, PlayCircle } from 'lucide-react';

export const WorkoutDayCard = ({
  dia, nomeDia, treino, isToday, isPast, onIniciarTreino, onTreinoFinalizado
}) => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ finalizado: false, finalizado_em: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      if (!session?.tokenKey) return setLoading(false);
      setLoading(true);
      try {
        const dataReferencia = new Date();
        const diaSemanaAtual = dataReferencia.getDay();
        const diaSemanaAlvo = getDiaNumero(dia);
        let dataAlvo = new Date(dataReferencia);
        const diff = diaSemanaAlvo - diaSemanaAtual;
        if (isPast && diff > 0) dataAlvo.setDate(dataAlvo.getDate() - 7);
        else if (!isPast && diff !== 0) dataAlvo.setDate(dataAlvo.getDate() + diff);

        const workoutStatus = await getWorkoutStatus(session.tokenKey, dataAlvo);
        setStatus(workoutStatus);
      } catch (err) {
        console.error('Erro loadStatus:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [session, dia, isPast]);

  const handleIniciar = () => {
    if (status.finalizado) {
      showToast('info', `Treino de ${nomeDia} já foi concluído!`);
      return;
    }
    if (isPast && !status.finalizado) {
      showToast('warning', `Este treino está atrasado. Finalize-o hoje!`);
    }
    if (typeof onIniciarTreino === 'function') {
      onIniciarTreino({ dia, nomeDia, treino });
    }
    navigate(`/treino/dia/${dia}`, { state: { treino, dia, nomeDia } });
  };

  const isBlocked = !isToday && !isPast && !status.finalizado;
  const isCompleted = status.finalizado;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300
      ${isCompleted ? 'opacity-75 border-l-4 border-green-500' : ''}
      ${isBlocked ? 'opacity-50 grayscale' : ''}
    `}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{nomeDia}</h3>
          {isToday && !isCompleted && <span className="text-xs text-primary-500 font-medium">🔴 Hoje</span>}
          {isCompleted && <span className="text-xs text-green-500 font-medium flex items-center gap-1"><CheckCircle size={12} /> Concluído</span>}
          {isPast && !isCompleted && <span className="text-xs text-yellow-500 font-medium">⚠️ Pendente</span>}
        </div>
        {isCompleted && <div className="text-green-500"><CheckCircle size={28} /></div>}
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{treino?.descricao || 'Treino do dia'}</p>
        <div className="flex gap-2 text-xs text-gray-500 mb-4">
          <span>💪 {treino?.exercicios?.length || 0} exercícios</span>
          <span>⏱️ {treino?.duracao || 45} min</span>
        </div>

        {!isCompleted ? (
          <button
            onClick={handleIniciar}
            disabled={isBlocked}
            className={`
              w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2
              ${isBlocked ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-primary-500 hover:bg-primary-600 text-white'}
            `}
          >
            <PlayCircle size={18} />
            {isBlocked ? 'Aguardando dia' : 'Iniciar treino'}
          </button>
        ) : (
          <div className="text-center text-green-500 text-sm">
            ✅ Treino realizado em {status.finalizado_em ? new Date(status.finalizado_em).toLocaleDateString() : ' — '}
          </div>
        )}
      </div>
    </div>
  );
};

// Mapeia 'segunda' -> 1 etc.
function getDiaNumero(dia) {
  const dias = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
  return dias[dia] ?? 1;
}
