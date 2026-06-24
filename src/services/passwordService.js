import { database, ref, get, set, update } from '@config/firebase.config'

// Salt fixo baseado no celular (determinístico)
export const getSalt = (celular) => {
  return `peakos_${celular}_2026`
}

// Hash SHA-256 via Web Crypto API (nativa, sem dependências)
export const hashPassword = async (password, salt) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Validar formato da senha pessoal (mínimo 6 caracteres)
const validatePasswordFormat = (password) => {
  return password && password.length >= 6
}

// Verificar se usuário já tem senha pessoal configurada
export const checkPersonalPasswordSetup = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_passwords/${encodedKey}`))
    return snapshot.exists()
  } catch (error) {
    console.error('Erro ao verificar configuração de senha pessoal:', error)
    return false
  }
}

// Criar senha pessoal
export const createPersonalPassword = async (tokenKey, celular, password) => {
  try {
    // Validar formato
    if (!validatePasswordFormat(password)) {
      return { success: false, message: 'A senha deve ter pelo menos 6 caracteres' }
    }

    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const salt = getSalt(celular)
    const passwordHash = await hashPassword(password, salt)

    await set(ref(database, `gymai_passwords/${encodedKey}`), {
      hash: passwordHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      failedAttempts: 0,
      blockedUntil: null
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao criar senha pessoal:', error)
    return { success: false, message: 'Erro ao criar senha pessoal' }
  }
}

// Verificar senha pessoal
export const verifyPersonalPassword = async (tokenKey, password, celular) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_passwords/${encodedKey}`))

    if (!snapshot.exists()) {
      return { success: false, message: 'Senha pessoal não configurada' }
    }

    const data = snapshot.val()
    const { hash, failedAttempts, blockedUntil } = data

    // Verificar bloqueio temporário
    if (blockedUntil && Date.now() < blockedUntil) {
      const minutesLeft = Math.ceil((blockedUntil - Date.now()) / 60000)
      return { success: false, message: `Muitas tentativas. Tente novamente em ${minutesLeft} minuto(s)` }
    }

    // Verificar senha
    const salt = getSalt(celular)
    const inputHash = await hashPassword(password, salt)

    if (inputHash === hash) {
      // Senha correta — resetar tentativas e fazer login
      await update(ref(database, `gymai_passwords/${encodedKey}`), {
        failedAttempts: 0,
        blockedUntil: null,
        lastLogin: Date.now()
      })
      return { success: true }
    } else {
      // Senha incorreta
      const newAttempts = (failedAttempts || 0) + 1
      const updateData = { failedAttempts: newAttempts }

      // Bloquear após 3 tentativas por 5 minutos
      if (newAttempts >= 3) {
        updateData.blockedUntil = Date.now() + (5 * 60 * 1000)
        updateData.failedAttempts = 0
        return { success: false, message: 'Conta bloqueada por 5 minutos. Muitas tentativas incorretas.' }
      }

      await update(ref(database, `gymai_passwords/${encodedKey}`), updateData)
      return { success: false, message: `Senha incorreta. ${3 - newAttempts} tentativa(s) restante(s)` }
    }
  } catch (error) {
    console.error('Erro ao verificar senha pessoal:', error)
    return { success: false, message: 'Erro ao verificar senha pessoal' }
  }
}

// Obter informações de lockout
export const getPasswordLockoutInfo = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_passwords/${encodedKey}`))

    if (!snapshot.exists()) {
      return { locked: false }
    }

    const data = snapshot.val()
    const { blockedUntil, failedAttempts } = data

    if (blockedUntil && blockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((blockedUntil - Date.now()) / 60000)
      return { locked: true, minutesLeft, failedAttempts }
    }

    return { locked: false, failedAttempts }
  } catch (error) {
    console.error('Erro ao obter informações de lockout:', error)
    return { locked: false }
  }
}
