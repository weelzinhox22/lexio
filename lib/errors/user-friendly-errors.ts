/**
 * Mensagens de erro amigáveis ao usuário
 * 
 * Regra de ouro: Todo erro deve responder 3 coisas:
 * 1. O que aconteceu
 * 2. Por que pode ter acontecido
 * 3. O que o usuário pode fazer agora
 */

export type ErrorContext = 
  | 'email_send'
  | 'deadline_create'
  | 'deadline_update'
  | 'process_create'
  | 'document_upload'
  | 'generic'

export interface UserFriendlyError {
  title: string
  what: string
  why: string
  action: string
  severity: 'info' | 'warning' | 'error'
}

const ERROR_MESSAGES: Record<string, UserFriendlyError> = {
  // Erros de envio de e-mail
  'email_send_timeout': {
    title: 'Não conseguimos enviar o alerta agora',
    what: 'O envio do alerta por e-mail demorou mais que o esperado.',
    why: 'Isso pode ser instabilidade temporária no serviço de e-mail ou problemas de conexão.',
    action: 'Vamos tentar novamente automaticamente em alguns instantes. Se o problema persistir, verifique suas configurações de e-mail.',
    severity: 'warning',
  },
  'email_send_failed': {
    title: 'Não conseguimos enviar o alerta por e-mail',
    what: 'O alerta não foi enviado para o endereço configurado.',
    why: 'Isso pode acontecer se o e-mail estiver inválido, inativo ou se houver problema temporário no serviço.',
    action: 'Verifique se o e-mail está correto em Configurações > Notificações. Você também pode adicionar um e-mail alternativo como backup.',
    severity: 'error',
  },
  'email_send_rate_limit': {
    title: 'Muitos e-mails enviados recentemente',
    what: 'O envio foi temporariamente limitado para evitar spam.',
    why: 'Isso acontece quando há muitos envios em um curto período de tempo.',
    action: 'Aguarde alguns minutos e tente novamente. Os alertas serão enviados normalmente após o limite ser resetado.',
    severity: 'warning',
  },

  // Erros de criação de prazo
  'deadline_create_failed': {
    title: 'Não foi possível criar o prazo',
    what: 'O prazo não foi salvo no sistema.',
    why: 'Isso pode acontecer se houver problema de conexão ou se algum campo obrigatório estiver faltando.',
    action: 'Verifique se todos os campos obrigatórios estão preenchidos e tente novamente. Se o problema persistir, recarregue a página.',
    severity: 'error',
  },
  'deadline_update_failed': {
    title: 'Não foi possível atualizar o prazo',
    what: 'As alterações no prazo não foram salvas.',
    why: 'Isso pode acontecer se houver problema de conexão ou se o prazo foi deletado por outro usuário.',
    action: 'Recarregue a página e tente novamente. Se o problema persistir, verifique sua conexão com a internet.',
    severity: 'error',
  },

  // Erros de processo
  'process_create_failed': {
    title: 'Não foi possível cadastrar o processo',
    what: 'O processo não foi salvo no sistema.',
    why: 'Isso pode acontecer se houver problema de conexão ou se o número do processo já estiver cadastrado.',
    action: 'Verifique se o número do processo está correto e não foi cadastrado anteriormente. Tente novamente.',
    severity: 'error',
  },

  // Erros de upload de documento
  'document_upload_failed': {
    title: 'Não foi possível fazer upload do documento',
    what: 'O arquivo não foi enviado para o sistema.',
    why: 'Isso pode acontecer se o arquivo for muito grande, estiver corrompido ou houver problema de conexão.',
    action: 'Verifique se o arquivo tem menos de 50 MB e está em formato válido (PDF, DOCX, etc). Tente novamente.',
    severity: 'error',
  },

  // Erro genérico
  'generic_error': {
    title: 'Algo deu errado',
    what: 'Não foi possível completar a ação solicitada.',
    why: 'Isso pode ser um problema temporário do sistema ou de conexão.',
    action: 'Tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.',
    severity: 'error',
  },
}

/**
 * Retorna mensagem de erro amigável baseada no tipo de erro
 */
export function getUserFriendlyError(
  errorType: string,
  context: ErrorContext = 'generic'
): UserFriendlyError {
  // Tentar encontrar erro específico
  const specificError = ERROR_MESSAGES[errorType]
  if (specificError) return specificError

  // Tentar encontrar erro por contexto
  const contextError = ERROR_MESSAGES[`${context}_failed`]
  if (contextError) return contextError

  // Retornar erro genérico
  return ERROR_MESSAGES['generic_error']
}

/**
 * Extrai tipo de erro de uma mensagem de erro
 */
export function extractErrorType(error: string | Error): string {
  const errorMessage = error instanceof Error ? error.message : error
  const errorLower = errorMessage.toLowerCase()

  // Detectar tipos comuns
  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return 'email_send_timeout'
  }
  if (errorLower.includes('rate limit') || errorLower.includes('too many requests')) {
    return 'email_send_rate_limit'
  }
  if (errorLower.includes('email') && (errorLower.includes('fail') || errorLower.includes('error'))) {
    return 'email_send_failed'
  }
  if (errorLower.includes('deadline') && errorLower.includes('create')) {
    return 'deadline_create_failed'
  }
  if (errorLower.includes('deadline') && errorLower.includes('update')) {
    return 'deadline_update_failed'
  }
  if (errorLower.includes('process') && errorLower.includes('create')) {
    return 'process_create_failed'
  }
  if (errorLower.includes('document') || errorLower.includes('upload')) {
    return 'document_upload_failed'
  }

  return 'generic_error'
}



