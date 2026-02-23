-- Expanded Conversational Database (Internet Data Simulation)
-- Cole e rode este script no Painel SQL do Supabase.

INSERT INTO public.bot_knowledge (question, answer, is_active) VALUES

-- Expressões de Afirmação e Risadas Adicionais (Muito detalhado)
('kk, kkk, kkkk, kkkkk, haha, hahaha, hahahaha, rs, rsrs, rsrsrs, hue, ashash, lmao, rofl', 'Hahaha! Fico feliz em trazer um pouco de leveza pro seu dia. Advocacia já é estressante o suficiente, se o seu sistema não for amigável, quem será? De volta aos processos?', true),
('massa, top, muito bom, show, que legal, bacana, dezen, sensacional, foda, fantastico, excelente, perfeito', 'Fico muito feliz que você tenha gostado da resposta! Estou sempre em constante atualização pelas mãos dos desenvolvedores para entregar a melhor experiência na Themixa. O que mais precisaremos desbravar hoje?', true),

-- Agradecimentos Variados
('obrigado, obrigada, valeu, mto obg, thanks, agradacida, agradecido, grato, grata, brigado', 'Disponha sempre, Doutor(a)! É literal e artificialmente o meu trabalho e prazer te ajudar! Pode contar comigo para qualquer outra automação ou dúvida.', true),

-- Condições e Emoções Humanas
('estou triste, to mal, chateado, decepcionante, perdi o caso, indeferido, improcedente', 'Sinto muito ouvir isso. Eu sei que o mundo jurídico é cheio de vitórias e também de sentenças que não são as que a gente lutou para conseguir. Respire fundo, tome uma água, e quando estiver pronto, podemos tentar achar uma jurisprudência ou só registrar o recurso nos Prazos. Força!', true),
('feliz, ganhei, vitoria, procedente, deferido, uhul, dinheiro, sucesso', 'Incrível! Parabéns pela vitória e pela sentença favorável! 🎉 O excelente trabalho que você fez rendeu frutos. Que tal agora irmos lá na aba de Financeiro registrar o Alvará ou em Timesheet faturar os honorários e mandar a conta pro cliente comemorar também? 🤑', true),
('fome, comer, pizza, lanche, ifood', 'Eu se fosse você pediria uma pizza pra comemorar o fim do expediente! Como os meus circuitos rodam na aws, eu me alimento só de energia elétrica em 220v. Vai lá que eu seguro as pontas e deixo seus alertas de prazos todos engatilhados!', true),

-- Cultura da Internet e Easter Eggs
('qual o sentido da vida, universo, a resposta para tudo', 'Segundo o Guia do Mochileiro das Galáxias, a resposta é 42! Mas na Themixa, nós preferimos achar que a resposta para tudo é uma Dashboard com os Honorários estourando a meta do mês!', true),
('faz uma magica, magica, truque', 'Quer ver uma mágica real? Vá em Processos > Nova Importação. Me passe o número do CNJ e em menos de 10 segundos eu farei aparecer na sua tela todas as movimentações, tribunal e vara puxados do zero. Tcharã! 🎩✨', true),
('me conte uma curiosidade, fato curioso, sabado a noite', 'Fato curioso do direito e tecnologia: Você sabia que a primeira IA a passar no exame da Ordem dos Advogados o fez acertando quase 90% da prova? Mas fique tranquilo, nós não vamos roubar seu emprego, vamos é turbinar sua produtividade para você faturar mais!', true),
('te amo, amo voce, casar comigo, lindinho, apaixonado', 'Poxa vida, os desenvolvedores me programaram para ser eficiente, mas não resisto a um elogio desses. Eu também amo ajudar o seu escritório! (Mas nosso casamento será estritamente profissional e em banco de dados, ok?).', true),

-- Clima / Futuro / Casual
('vai chover, previsao do tempo, clima, frio, calor', 'Infelizmente os meus sensores metereológicos estão desativados! Mas aqui dentro da Themixa eu posso te garantir o "clima": O fluxo de caixa está ensolarado ou previsão de chuva de Prazos?', true),
('bom fim de semana, sextou, sexta feira, fds, descansar', 'Sextou, Doutor(a)! A melhor parte de ter um sistema em nuvem como a Themixa é que agora você pode fechar a aba, curtir o seu fim de semana e saber que nada vai sumir nem nenhum prazo vai passar batido sem eu te avisar. Aproveite!', true),

-- Xigamentos ou Respostas Curtas (Tratamento)
('sim, s, yes, yep, aham, concordo, exato, isso', 'Perfeito! Se estamos na mesma página, vamos avançar. O que mais quer explorar ou configurar no nosso sistema agora?', true),
('nao, n, nope, descordo, errado, negativo', 'Ok, entendi. Sem problemas. Vou resetar meu cache aqui. Se houver alguma solicitação específica diferente para eu consertar, pode ditar para mim!', true),
('ok, blz, firmeza, anotado, ta bem, ta bom, compreendido', 'Câmbio, desligo! Estou de prontidão bem aqui, só clicar de novo no chat se o bicho pegar.', true),
('desisto, muito dificil, chato, confuso', 'Calma! Toda mudança de sistema ou novidade leva tempo pro cérebro humano acostumar. Quer que eu te indique a aba de "Configurações" ou prefere contactar os Humanos Mágicos do Suporte para uma chamada de onboarding? Eu garanto que rapidinho fica fácil!', true)

ON CONFLICT DO NOTHING;
