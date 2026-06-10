import { database, ref, get, update } from '@config/firebase.config'

// Verificar status do usuário periodicamente
export const checkUserStatus = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const userRef = ref(database, `gymai_tokens/${encodedKey}`)
    const snapshot = await get(userRef)
    
    if (!snapshot.exists()) {
      return { active: false, reason: 'user_not_found' }
    }
    
    const userData = snapshot.val()
    
    // Verificar se o usuário está ativo
    if (userData.status === 'inactive' || userData.status === 'suspended') {
      return { active: false, reason: userData.status }
    }
    
    // Verificar se a licença expirou
    if (userData.expiresAt && userData.expiresAt < Date.now()) {
      return { active: false, reason: 'license_expired' }
    }
    
    return { active: true, userData }
  } catch (error) {
    console.error('Erro ao verificar status do usuário:', error)
    return { active: false, reason: 'error' }
  }
}

// Atualizar último acesso do usuário
export const updateLastAccess = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const userRef = ref(database, `gymai_tokens/${encodedKey}`)
    await update(userRef, {
      lastAccess: Date.now()
    })
  } catch (error) {
    console.error('Erro ao atualizar último acesso:', error)
  }
}

// Verificar 2FA
export const verify2FA = async (tokenKey, password) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const userRef = ref(database, `gymai_tokens/${encodedKey}`)
    const snapshot = await get(userRef)
    
    if (!snapshot.exists()) {
      return { success: false, message: 'Usuário não encontrado' }
    }
    
    const userData = snapshot.val()
    
    // Verificar se o usuário tem 2FA configurado
    if (!userData.twoFactorPassword) {
      return { success: false, message: '2FA não configurado' }
    }
    
    // Verificar a senha (em produção, usar hash)
    if (userData.twoFactorPassword !== password) {
      return { success: false, message: 'Senha incorreta' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao verificar 2FA:', error)
    return { success: false, message: 'Erro ao verificar 2FA' }
  }
}

// Configurar 2FA
export const setup2FA = async (tokenKey, phoneNumber, password) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    const userRef = ref(database, `gymai_tokens/${encodedKey}`)
    
    // Em produção, fazer hash da senha
    await update(userRef, {
      twoFactorPhone: phoneNumber,
      twoFactorPassword: password,
      twoFactorEnabled: true,
      twoFactorSetupAt: Date.now()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao configurar 2FA:', error)
    return { success: false, message: 'Erro ao configurar 2FA' }
  }
}
