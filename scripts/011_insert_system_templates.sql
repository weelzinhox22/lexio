-- ============================================
-- INSERIR TEMPLATES DO SISTEMA
-- ============================================

-- Criar um usuário fictício para templates do sistema (você deve substituir pelo ID de um usuário admin real)
-- Por enquanto, vamos usar um UUID fixo que você pode substituir depois
DO $$
DECLARE
    system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- 1. KIT BÁSICO
    
    -- Procuração Ad Judicia
    INSERT INTO public.document_templates (user_id, name, category, subcategory, description, content, placeholders, is_system)
    VALUES (
        system_user_id,
        'Procuração Ad Judicia',
        'kit_basico',
        'procuracao',
        'Outorga poderes para representação judicial',
        E'PROCURAÇÃO AD JUDICIA\n\nOutorgante: {{NOME_CLIENTE}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) da Cédula de Identidade RG nº {{RG_CLIENTE}}, inscrito(a) no CPF sob nº {{CPF_CLIENTE}}, residente e domiciliado(a) à {{ENDERECO_CLIENTE}}, {{CIDADE_CLIENTE}} - {{ESTADO_CLIENTE}}.\n\nOutorgado: {{NOME_ADVOGADO}}, brasileiro(a), advogado(a), inscrito(a) na OAB/{{UF_OAB}} sob nº {{NUMERO_OAB}}, com escritório profissional situado à {{ENDERECO_ESCRITORIO}}.\n\nPoderes: O outorgante confere ao outorgado os poderes da cláusula ad judicia, para representá-lo perante qualquer juízo, instância ou tribunal, podendo propor as ações competentes e acompanhar as já propostas até final decisão, conferindo-lhe, ainda, poderes especiais para confessar, transigir, desistir, firmar compromissos ou acordos, receber e dar quitação, podendo ainda substabelecer esta em outrem, com ou sem reservas de iguais poderes.\n\n{{CIDADE_ESCRITORIO}}, {{DATA_ATUAL}}.\n\n_________________________________\n{{NOME_CLIENTE}}\nOutorgante',
        '["NOME_CLIENTE", "ESTADO_CIVIL", "PROFISSAO", "RG_CLIENTE", "CPF_CLIENTE", "ENDERECO_CLIENTE", "CIDADE_CLIENTE", "ESTADO_CLIENTE", "NOME_ADVOGADO", "UF_OAB", "NUMERO_OAB", "ENDERECO_ESCRITORIO", "CIDADE_ESCRITORIO", "DATA_ATUAL"]'::jsonb,
        true
    ) ON CONFLICT DO NOTHING;

    -- Contrato de Honorários
    INSERT INTO public.document_templates (user_id, name, category, subcategory, description, content, placeholders, is_system)
    VALUES (
        system_user_id,
        'Contrato de Honorários Advocatícios',
        'kit_basico',
        'contrato',
        'Contrato de prestação de serviços advocatícios',
        E'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS\n\nCONTRATANTE: {{NOME_CLIENTE}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CLIENTE}}, residente à {{ENDERECO_CLIENTE}}.\n\nCONTRATADO: {{NOME_ADVOGADO}}, inscrito(a) na OAB/{{UF_OAB}} sob nº {{NUMERO_OAB}}, com escritório à {{ENDERECO_ESCRITORIO}}.\n\nOBJETO: O presente contrato tem por objeto a prestação de serviços advocatícios pelo CONTRATADO ao CONTRATANTE, consistente em {{DESCRICAO_SERVICO}}.\n\nHONORÁRIOS: Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO o valor de R$ {{VALOR_HONORARIOS}} ({{VALOR_HONORARIOS_EXTENSO}}), da seguinte forma: {{FORMA_PAGAMENTO}}.\n\nPRAZO: O presente contrato terá vigência a partir de {{DATA_INICIO}} até {{DATA_FIM}} ou até a conclusão dos serviços.\n\nDISPOSIÇÕES GERAIS: O CONTRATANTE declara estar ciente de que os honorários de sucumbência pertencem exclusivamente ao advogado, nos termos do art. 22, §4º, da Lei 8.906/94.\n\n{{CIDADE_ESCRITORIO}}, {{DATA_ATUAL}}.\n\n_________________________          _________________________\n{{NOME_CLIENTE}}                  {{NOME_ADVOGADO}}\nCONTRATANTE                      CONTRATADO\n                                  OAB/{{UF_OAB}} {{NUMERO_OAB}}',
        '["NOME_CLIENTE", "ESTADO_CIVIL", "PROFISSAO", "CPF_CLIENTE", "ENDERECO_CLIENTE", "NOME_ADVOGADO", "UF_OAB", "NUMERO_OAB", "ENDERECO_ESCRITORIO", "DESCRICAO_SERVICO", "VALOR_HONORARIOS", "VALOR_HONORARIOS_EXTENSO", "FORMA_PAGAMENTO", "DATA_INICIO", "DATA_FIM", "CIDADE_ESCRITORIO", "DATA_ATUAL"]'::jsonb,
        true
    ) ON CONFLICT DO NOTHING;

    -- 2. DIREITO DO CONSUMIDOR
    
    -- Ação de Indenização por Negativação Indevida
    INSERT INTO public.document_templates (user_id, name, category, subcategory, description, content, placeholders, is_system)
    VALUES (
        system_user_id,
        'Ação de Indenização - Negativação Indevida',
        'direito_consumidor',
        'peticao_inicial',
        'Pedido de indenização por negativação indevida do nome',
        E'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{VARA}} VARA CÍVEL DA COMARCA DE {{COMARCA}}\n\n{{NOME_CLIENTE}}, {{NACIONALIDADE}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CLIENTE}}, residente à {{ENDERECO_CLIENTE}}, por seu advogado que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, propor\n\nAÇÃO DE INDENIZAÇÃO POR DANOS MORAIS\nCOM PEDIDO DE TUTELA DE URGÊNCIA\n\nem face de {{NOME_REU}}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº {{CNPJ_REU}}, com sede à {{ENDERECO_REU}}, pelos fatos e fundamentos a seguir expostos:\n\nI - DOS FATOS\n\nO(A) Autor(a) teve seu nome negativado indevidamente pelo(a) Réu(é), conforme se verifica do documento anexo, referente a suposto débito no valor de R$ {{VALOR_DEBITO}}, oriundo de {{ORIGEM_DEBITO}}.\n\nOcorre que o(a) Autor(a) jamais manteve qualquer relação jurídica com o(a) Réu(é) que justificasse tal cobrança, tratando-se de evidente erro ou fraude.\n\nII - DO DIREITO\n\nNos termos do art. 14 do CDC, o fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores.\n\nA negativação indevida do nome configura dano moral in re ipsa, ou seja, presumido, conforme jurisprudência pacífica do STJ.\n\nIII - DO PEDIDO\n\nDiante do exposto, requer:\n\na) A concessão de tutela de urgência para determinar a exclusão imediata do nome do(a) Autor(a) dos cadastros de proteção ao crédito;\n\nb) A procedência da ação para condenar o(a) Réu(é) ao pagamento de indenização por danos morais no valor de R$ {{VALOR_INDENIZACAO}};\n\nc) A condenação do(a) Réu(é) ao pagamento das custas processuais e honorários advocatícios.\n\nDá-se à causa o valor de R$ {{VALOR_CAUSA}}.\n\nNestes termos, pede deferimento.\n\n{{CIDADE_ESCRITORIO}}, {{DATA_ATUAL}}.\n\n_________________________________\n{{NOME_ADVOGADO}}\nOAB/{{UF_OAB}} {{NUMERO_OAB}}',
        '["VARA", "COMARCA", "NOME_CLIENTE", "NACIONALIDADE", "ESTADO_CIVIL", "PROFISSAO", "CPF_CLIENTE", "ENDERECO_CLIENTE", "NOME_REU", "CNPJ_REU", "ENDERECO_REU", "VALOR_DEBITO", "ORIGEM_DEBITO", "VALOR_INDENIZACAO", "VALOR_CAUSA", "CIDADE_ESCRITORIO", "DATA_ATUAL", "NOME_ADVOGADO", "UF_OAB", "NUMERO_OAB"]'::jsonb,
        true
    ) ON CONFLICT DO NOTHING;

    -- 3. DIREITO DE FAMÍLIA
    
    -- Divórcio Consensual
    INSERT INTO public.document_templates (user_id, name, category, subcategory, description, content, placeholders, is_system)
    VALUES (
        system_user_id,
        'Petição Inicial - Divórcio Consensual',
        'direito_familia',
        'peticao_inicial',
        'Pedido de divórcio consensual sem filhos menores',
        E'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{VARA}} VARA DE FAMÍLIA DA COMARCA DE {{COMARCA}}\n\n{{NOME_REQUERENTE_1}}, {{NACIONALIDADE_1}}, {{PROFISSAO_1}}, portador(a) do CPF nº {{CPF_REQUERENTE_1}}, e {{NOME_REQUERENTE_2}}, {{NACIONALIDADE_2}}, {{PROFISSAO_2}}, portador(a) do CPF nº {{CPF_REQUERENTE_2}}, por seu advogado que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, propor\n\nAÇÃO DE DIVÓRCIO CONSENSUAL\n\npelos fatos e fundamentos a seguir expostos:\n\nI - DOS FATOS\n\nOs Requerentes contraíram matrimônio em {{DATA_CASAMENTO}}, conforme certidão de casamento anexa.\n\nNão havendo mais interesse na manutenção do vínculo conjugal, e estando plenamente de acordo com todos os termos da separação, vêm os Requerentes postular o divórcio.\n\nII - DA PARTILHA DE BENS\n\n{{CLAUSULA_PARTILHA}}\n\nIII - DO DIREITO\n\nO divórcio consensual está previsto no art. 1.580 do Código Civil e pode ser requerido a qualquer tempo, independentemente de prazo.\n\nIV - DO PEDIDO\n\nDiante do exposto, requerem:\n\na) A decretação do divórcio;\n\nb) A homologação da partilha de bens conforme acordado;\n\nc) {{OUTROS_PEDIDOS}}\n\nDá-se à causa o valor de R$ {{VALOR_CAUSA}}.\n\nNestes termos, pede deferimento.\n\n{{CIDADE_ESCRITORIO}}, {{DATA_ATUAL}}.\n\n_________________________________\n{{NOME_ADVOGADO}}\nOAB/{{UF_OAB}} {{NUMERO_OAB}}',
        '["VARA", "COMARCA", "NOME_REQUERENTE_1", "NACIONALIDADE_1", "PROFISSAO_1", "CPF_REQUERENTE_1", "NOME_REQUERENTE_2", "NACIONALIDADE_2", "PROFISSAO_2", "CPF_REQUERENTE_2", "DATA_CASAMENTO", "CLAUSULA_PARTILHA", "OUTROS_PEDIDOS", "VALOR_CAUSA", "CIDADE_ESCRITORIO", "DATA_ATUAL", "NOME_ADVOGADO", "UF_OAB", "NUMERO_OAB"]'::jsonb,
        true
    ) ON CONFLICT DO NOTHING;

    -- 4. DIREITO TRABALHISTA
    
    -- Reclamação Trabalhista
    INSERT INTO public.document_templates (user_id, name, category, subcategory, description, content, placeholders, is_system)
    VALUES (
        system_user_id,
        'Reclamação Trabalhista',
        'direito_trabalhista',
        'peticao_inicial',
        'Reclamação trabalhista para cobrança de verbas rescisórias',
        E'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA {{VARA}} VARA DO TRABALHO DE {{COMARCA}}\n\n{{NOME_RECLAMANTE}}, {{NACIONALIDADE}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) da CTPS nº {{CTPS}}, CPF nº {{CPF_RECLAMANTE}}, residente à {{ENDERECO_RECLAMANTE}}, vem, por seu advogado que esta subscreve, propor\n\nRECLAMAÇÃO TRABALHISTA\n\nem face de {{NOME_RECLAMADA}}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº {{CNPJ_RECLAMADA}}, com sede à {{ENDERECO_RECLAMADA}}, pelos fatos e fundamentos a seguir expostos:\n\nI - DOS FATOS\n\nO(A) Reclamante foi admitido(a) em {{DATA_ADMISSAO}}, exercendo a função de {{FUNCAO}}, com salário de R$ {{SALARIO}}.\n\nForam prestados serviços até {{DATA_DEMISSAO}}, quando foi dispensado(a) sem justa causa.\n\nII - DAS VERBAS DEVIDAS\n\nA Reclamada deixou de pagar as seguintes verbas:\n\n{{LISTA_VERBAS}}\n\nIII - DO DIREITO\n\n{{FUNDAMENTO_JURIDICO}}\n\nIV - DO PEDIDO\n\nDiante do exposto, requer:\n\na) A condenação da Reclamada ao pagamento das verbas discriminadas;\n\nb) O pagamento de custas processuais e honorários advocatícios.\n\nDá-se à causa o valor de R$ {{VALOR_CAUSA}}.\n\nNestes termos, pede deferimento.\n\n{{CIDADE_ESCRITORIO}}, {{DATA_ATUAL}}.\n\n_________________________________\n{{NOME_ADVOGADO}}\nOAB/{{UF_OAB}} {{NUMERO_OAB}}',
        '["VARA", "COMARCA", "NOME_RECLAMANTE", "NACIONALIDADE", "ESTADO_CIVIL", "PROFISSAO", "CTPS", "CPF_RECLAMANTE", "ENDERECO_RECLAMANTE", "NOME_RECLAMADA", "CNPJ_RECLAMADA", "ENDERECO_RECLAMADA", "DATA_ADMISSAO", "FUNCAO", "SALARIO", "DATA_DEMISSAO", "LISTA_VERBAS", "FUNDAMENTO_JURIDICO", "VALOR_CAUSA", "CIDADE_ESCRITORIO", "DATA_ATUAL", "NOME_ADVOGADO", "UF_OAB", "NUMERO_OAB"]'::jsonb,
        true
    ) ON CONFLICT DO NOTHING;

END $$;

SELECT 'Templates do sistema inseridos com sucesso!' as status;

