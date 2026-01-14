-- ============================================
-- ADICIONAR CAMPO EMAIL_FALLBACK
-- ============================================
-- Adiciona campo para e-mail alternativo (fallback) nas configurações de notificação

ALTER TABLE public.notification_settings
ADD COLUMN IF NOT EXISTS email_fallback TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.notification_settings.email_fallback IS 'E-mail alternativo usado como fallback quando o e-mail principal falha';

SELECT 'Campo email_fallback adicionado com sucesso!' as status;



