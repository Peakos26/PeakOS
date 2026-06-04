import { database } from '@config/firebase.config'

export const timelineService = {
  async saveTimelineEntry(tokenKey, entryData) {
    try {
      const entryRef = database.ref(`gymai_timeline/${tokenKey}`).push()
      await entryRef.set({
        ...entryData,
        createdAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar entrada da timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async getTimeline(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_timeline/${tokenKey}`).once('value')
      const timeline = snapshot.val()
      
      if (!timeline) {
        return { success: true, data: [] }
      }

      const timelineArray = Object.values(timeline).sort((a, b) => b.createdAt - a.createdAt)
      return { success: true, data: timelineArray }
    } catch (error) {
      console.error('Erro ao buscar timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async addPhotoToTimeline(tokenKey, photoData, notes = '') {
    try {
      const entryData = {
        type: 'photo',
        photos: photoData,
        notes,
        bodyComposition: photoData.bodyComposition || {}
      }
      return await this.saveTimelineEntry(tokenKey, entryData)
    } catch (error) {
      console.error('Erro ao adicionar foto à timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async addMeasurementToTimeline(tokenKey, measurementData, notes = '') {
    try {
      const entryData = {
        type: 'measurement',
        measurements: measurementData,
        notes
      }
      return await this.saveTimelineEntry(tokenKey, entryData)
    } catch (error) {
      console.error('Erro ao adicionar medição à timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async addMilestoneToTimeline(tokenKey, milestoneData) {
    try {
      const entryData = {
        type: 'milestone',
        milestone: milestoneData
      }
      return await this.saveTimelineEntry(tokenKey, entryData)
    } catch (error) {
      console.error('Erro ao adicionar marco à timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteTimelineEntry(tokenKey, entryId) {
    try {
      await database.ref(`gymai_timeline/${tokenKey}/${entryId}`).remove()
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar entrada da timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async compareTimelineEntries(tokenKey, entryId1, entryId2) {
    try {
      const snapshot = await database.ref(`gymai_timeline/${tokenKey}`).once('value')
      const timeline = snapshot.val()

      if (!timeline) {
        return { success: false, error: 'Timeline não encontrada' }
      }

      const entry1 = timeline[entryId1]
      const entry2 = timeline[entryId2]

      if (!entry1 || !entry2) {
        return { success: false, error: 'Entradas não encontradas' }
      }

      const comparison = {
        date1: entry1.createdAt,
        date2: entry2.createdAt,
        bodyCompositionChanges: {},
        measurementChanges: {}
      }

      // Comparar composição corporal
      if (entry1.bodyComposition && entry2.bodyComposition) {
        comparison.bodyCompositionChanges = {
          bodyFat: {
            before: entry1.bodyComposition.bodyFat,
            after: entry2.bodyComposition.bodyFat,
            change: (entry2.bodyComposition.bodyFat - entry1.bodyComposition.bodyFat).toFixed(1)
          },
          leanMass: {
            before: entry1.bodyComposition.leanMass,
            after: entry2.bodyComposition.leanMass,
            change: (entry2.bodyComposition.leanMass - entry1.bodyComposition.leanMass).toFixed(1)
          }
        }
      }

      // Comparar medidas
      if (entry1.measurements && entry2.measurements) {
        comparison.measurementChanges = {
          peso: {
            before: entry1.measurements.peso,
            after: entry2.measurements.peso,
            change: (entry2.measurements.peso - entry1.measurements.peso).toFixed(1)
          },
          cintura: {
            before: entry1.measurements.cintura,
            after: entry2.measurements.cintura,
            change: (entry2.measurements.cintura - entry1.measurements.cintura).toFixed(1)
          },
          peito: {
            before: entry1.measurements.peito,
            after: entry2.measurements.peito,
            change: (entry2.measurements.peito - entry1.measurements.peito).toFixed(1)
          }
        }
      }

      return { success: true, data: comparison }
    } catch (error) {
      console.error('Erro ao comparar entradas da timeline:', error)
      return { success: false, error: error.message }
    }
  },

  async generateTimelineReport(tokenKey) {
    try {
      const result = await this.getTimeline(tokenKey)
      if (!result.success) {
        return result
      }

      const timeline = result.data
      const report = {
        totalEntries: timeline.length,
        photos: timeline.filter(e => e.type === 'photo').length,
        measurements: timeline.filter(e => e.type === 'measurement').length,
        milestones: timeline.filter(e => e.type === 'milestone').length,
        firstEntry: timeline[timeline.length - 1],
        lastEntry: timeline[0],
        progress: this.calculateProgress(timeline)
      }

      return { success: true, data: report }
    } catch (error) {
      console.error('Erro ao gerar relatório da timeline:', error)
      return { success: false, error: error.message }
    }
  },

  calculateProgress(timeline) {
    if (timeline.length < 2) {
      return { hasProgress: false }
    }

    const firstEntry = timeline[timeline.length - 1]
    const lastEntry = timeline[0]

    let progress = {
      hasProgress: true,
      daysBetween: Math.round((lastEntry.createdAt - firstEntry.createdAt) / (24 * 60 * 60 * 1000)),
      changes: {}
    }

    // Calcular mudanças
    if (firstEntry.measurements && lastEntry.measurements) {
      progress.changes.peso = (lastEntry.measurements.peso - firstEntry.measurements.peso).toFixed(1)
      progress.changes.cintura = (lastEntry.measurements.cintura - firstEntry.measurements.cintura).toFixed(1)
    }

    if (firstEntry.bodyComposition && lastEntry.bodyComposition) {
      progress.changes.bodyFat = (lastEntry.bodyComposition.bodyFat - firstEntry.bodyComposition.bodyFat).toFixed(1)
      progress.changes.leanMass = (lastEntry.bodyComposition.leanMass - firstEntry.bodyComposition.leanMass).toFixed(1)
    }

    return progress
  }
}
