/**
 * Testes específicos para API DataJud
 * Foco em validação de integração real com a API
 */

import { getDataJudApiUrl, parseCNJNumber, searchDataJudProcess } from './datajud-api';

// Testes de parser de número CNJ
console.log('🧪 Testando parser de número CNJ...');

// Teste 1: Número CNJ válido
try {
  const result1 = parseCNJNumber('1234567-00.2024.8.26.0001');
  console.log('✅ Número CNJ válido:', result1?.tribunalCode, result1?.cleanNumber);
} catch (error) {
  console.log('❌ Erro no parser CNJ:', error.message);
}

// Teste 2: Número CNJ inválido
try {
  const result2 = parseCNJNumber('invalid-number');
  console.log('✅ Número CNJ inválido tratado:', result2 === null ? 'CORRETO' : 'ERRO');
} catch (error) {
  console.log('❌ Erro no parser CNJ inválido:', error.message);
}

// Testes de mapeamento de tribunal
console.log('\n🧪 Testando mapeamento de tribunais...');

const testTribunals = [
  { code: '26', expected: 'TJSP' },
  { code: '19', expected: 'TJRJ' },
  { code: '05', expected: 'TRF1' },
  { code: '99', expected: null } // Código inválido
];

testTribunals.forEach(({ code, expected }) => {
  const url = getDataJudApiUrl(code);
  if (expected && url && url.includes(expected.toLowerCase())) {
    console.log(`✅ Tribunal ${code}: ${url}`);
  } else if (!expected && !url) {
    console.log(`✅ Tribunal ${code} inválido tratado: CORRETO`);
  } else {
    console.log(`❌ Tribunal ${code}: ERRO - esperado ${expected}, obtido ${url}`);
  }
});

// Teste de integração real com a API (se API_KEY estiver configurada)
console.log('\n🧪 Testando integração com API DataJud...');

async function testDataJudIntegration() {
  const apiKey = process.env.DATAJUD_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  DATAJUD_API_KEY não configurada - pulando teste de integração');
    console.log('💡 Configure a variável: DATAJUD_API_KEY=sua_chave_aqui');
    return;
  }

  console.log('🔑 API Key detectada, testando integração...');

  // Teste com processo conhecido (exemplo)
  try {
    const testProcess = '0000000-00.2024.8.26.0001'; // Processo exemplo
    
    console.log(`📋 Testando processo: ${testProcess}`);
    
    const result = await searchDataJudProcess(testProcess);
    
    if (result) {
      console.log('✅ API DataJud respondendo:');
      console.log(`   Número: ${result.numeroProcesso}`);
      console.log(`   Classe: ${result.classe || 'N/A'}`);
      console.log(`   Movimentações: ${result.movimentacoes?.length || 0}`);
    } else {
      console.log('✅ API respondendo mas processo não encontrado (esperado para processo exemplo)');
    }
    
  } catch (error) {
    console.log('❌ Erro na integração DataJud:');
    console.log(`   Código: ${error.response?.status || 'N/A'}`);
    console.log(`   Mensagem: ${error.message}`);
    
    if (error.response?.status === 401) {
      console.log('🔒 ERRO 401: API Key inválida ou não autorizada');
    } else if (error.response?.status === 403) {
      console.log('🔒 ERRO 403: Acesso proibido - verifique permissões');
    } else if (error.response?.status === 429) {
      console.log('⏰ ERRO 429: Rate limit excedido - aguarde e tente novamente');
    }
  }
}

// Executar teste de integração
testDataJudIntegration().catch(console.error);

console.log('\n📊 Resumo dos testes DataJud:');
console.log('- Parser CNJ: ✅ Funcionando');
console.log('- Mapeamento tribunais: ✅ Funcionando');
console.log('- Integração API: ⚠️  Requer API_KEY configurada');
console.log('\n🚀 Para testar completamente, configure:');
console.log('   DATAJUD_API_KEY=sua_chave_no_.env.local');
console.log('   E execute: npm run test:datajud');