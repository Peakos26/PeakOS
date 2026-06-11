import { database, ref, get, set, update } from '@config/firebase.config'

// Gerar salt único para cada usuário
const generateSalt = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Hash simples com salt (em produção, usar bcrypt ou crypto-js)
const hashPassword = (password, salt) => {
  const str = password + salt
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// Validar formato da senha pessoal (6-8 dígitos numéricos)
const validatePasswordFormat = (password) => {
  const regex = /^\d{6,8}$/
  return regex.test(password)
}

// Verificar se usuário já tem senha pessoal configurada
export const checkPersonalPasswordSetup = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_personal_password/${encodedKey}`))
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
      return { success: false, message: 'A senha deve ter 6-8 dígitos numéricos' }
    }

    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const salt = generateSalt()
    const passwordHash = hashPassword(password, salt)

    await set(ref(database, `gymai_personal_password/${encodedKey}`), {
      password_hash: passwordHash,
      salt,
      celular,
      created_at: Date.now(),
      updated_at: Date.now(),
      failed_attempts: 0,
      locked_until: null
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao criar senha pessoal:', error)
    return { success: false, message: 'Erro ao criar senha pessoal' }
  }
}

// Verificar senha pessoal
export const verifyPersonalPassword = async (tokenKey, password) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_personal_password/${encodedKey}`))

    if (!snapshot.exists()) {
      return { success: false, message: 'Senha pessoal não configurada' }
    }

    const data = snapshot.val()
    const { password_hash, salt, failed_attempts, locked_until } = data

    // Verificar lockout
    if (locked_until && locked_until > Date.now()) {
      const minutesLeft = Math.ceil((locked_until - Date.now()) / 60000)
      return { success: false, message: `Muitas tentativas. Tente novamente em ${minutesLeft} minutos` }
    }

    // Validar senha
    const inputHash = hashPassword(password, salt)

    if (inputHash === password_hash) {
      // Sucesso - resetar tentativas
      await update(ref(database, `gymai_personal_password/${encodedKey}`), {
        failed_attempts: 0,
        locked_until: null
      })
      return { success: true }
    } else {
      // Falha - incrementar tentativas
      const newAttempts = (failed_attempts || 0) + 1
      const updateData = { failed_attempts: newAttempts }

      if (newAttempts >= 5) {
        updateData.locked_until = Date.now() + (15 * 60 * 1000) // 15 minutos
      }

      await update(ref(database, `gymai_personal_password/${encodedKey}`), updateData)

      if (newAttempts >= 5) {
        return { success: false, message: 'Muitas tentativas incorretas. Conta bloqueada por 15 minutos.' }
      }

      const attemptsLeft = 5 - newAttempts
      return { success: false, message: `Senha incorreta. ${attemptsLeft} tentativas restantes.` }
    }
  } catch (error) {
    console.error('Erro ao verificar senha pessoal:', error)
    return { success: false, message: 'Erro ao verificar senha pessoal' }
  }
}

// Atualizar senha pessoal
export const updatePersonalPassword = async (tokenKey, oldPassword, newPassword) => {
  try {
    // Validar formato da nova senha
    if (!validatePasswordFormat(newPassword)) {
      return { success: false, message: 'A nova senha deve ter 6-8 dígitos numéricos' }
    }

    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_personal_password/${encodedKey}`))

    if (!snapshot.exists()) {
      return { success: false, message: 'Senha pessoal não configurada' }
    }

    const data = snapshot.val()
    const { password_hash, salt } = data

    // Verificar senha antiga
    const oldHash = hashPassword(oldPassword, salt)
    if (oldHash !== password_hash) {
      return { success: false, message: 'Senha atual incorreta' }
    }

    // Criar nova senha
    const newSalt = generateSalt()
    const newPasswordHash = hashPassword(newPassword, newSalt)

    await update(ref(database, `gymai_personal_password/${encodedKey}`), {
      password_hash: newPasswordHash,
      salt: newSalt,
      updated_at: Date.now(),
      failed_attempts: 0,
      locked_until: null
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar senha pessoal:', error)
    return { success: false, message: 'Erro ao atualizar senha pessoal' }
  }
}

// Solicitar recuperação de senha (enviar código SMS)
export const requestPasswordRecovery = async (celular) => {
  try {
    // Buscar tokenKey pelo celular
    const requestsSnapshot = await get(ref(database, 'gymai_requests'))
    let tokenKey = null

    requestsSnapshot.forEach(child => {
      if (child.val().celular === celular && child.val().status === 'approved') {
        tokenKey = child.val().tokenKey || celular
      }
    })

    if (!tokenKey) {
      return { success: false, message: 'Usuário não encontrado' }
    }

    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    
    // Gerar código de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + (10 * 60 * 1000) // 10 minutos

    // Salvar código de recuperação
    await set(ref(database, `gymai_personal_password_recovery/${encodedKey}`), {
      code: recoveryCode,
      expires_at: expiresAt,
      used: false,
      created_at: Date.now()
    })

    // TODO: Integrar com serviço de SMS real
    console.log(`SMS Recovery Code for ${celular}: ${recoveryCode}`)

    return { success: true, message: 'Código de recuperação enviado para seu celular' }
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error)
    return { success: false, message: 'Erro ao solicitar recuperação de senha' }
  }
}

// Verificar código de recuperação
export const verifyRecoveryCode = async (tokenKey, code) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_personal_password_recovery/${encodedKey}`))

    if (!snapshot.exists()) {
      return { success: false, message: 'Código de recuperação não encontrado' }
    }

    const data = snapshot.val()

    // Verificar se já foi usado
    if (data.used) {
      return { success: false, message: 'Código já utilizado' }
    }

    // Verificar expiração
    if (data.expires_at < Date.now()) {
      return { success: false, message: 'Código expirado' }
    }

    // Verificar código
    if (data.code !== code) {
      return { success: false, message: 'Código incorreto' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao verificar código de recuperação:', error)
    return { success: false, message: 'Erro ao verificar código de recuperação' }
  }
}

// Redefinir senha pessoal com código de recuperação
export const resetPasswordWithCode = async (tokenKey, code, newPassword) => {
  try {
    // Validar formato
    if (!validatePasswordFormat(newPassword)) {
      return { success: false, message: 'A senha deve ter 6-8 dígitos numéricos' }
    }

    // Verificar código primeiro
    const verifyResult = await verifyRecoveryCode(tokenKey, code)
    if (!verifyResult.success) {
      return verifyResult
    }

    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const salt = generateSalt()
    const passwordHash = hashPassword(newPassword, salt)

    // Atualizar senha
    await update(ref(database, `gymai_personal_password/${encodedKey}`), {
      password_hash: passwordHash,
      salt,
      updated_at: Date.now(),
      failed_attempts: 0,
      locked_until: null
    })

    // Marcar código como usado
    await update(ref(database, `gymai_personal_password_recovery/${encodedKey}`), {
      used: true
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return { success: false, message: 'Erro ao redefinir senha' }
  }
}

// Obter informações de lockout
export const getPasswordLockoutInfo = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const snapshot = await get(ref(database, `gymai_personal_password/${encodedKey}`))

    if (!snapshot.exists()) {
      return { locked: false }
    }

    const data = snapshot.val()
    const { locked_until, failed_attempts } = data

    if (locked_until && locked_until > Date.now()) {
      const minutesLeft = Math.ceil((locked_until - Date.now()) / 60000)
      return { locked: true, minutesLeft, failedAttempts: failed_attempts }
    }

    return { locked: false, failedAttempts: failed_attempts }
  } catch (error) {
    console.error('Erro ao obter informações de lockout:', error)
    return { locked: false }
  }
}
