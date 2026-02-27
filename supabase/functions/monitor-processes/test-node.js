// Testes unitários para Edge Function - Versão Node.js

const assert = require('assert');

// Mock básico do Deno.env para Node.js
const Deno = {
  env: {
    get: (key) => {
      const envs = {
        'DATAJUD_API_KEY': 'test-key',
        'GOOGLE_CALENDAR_OAUTH_TOKEN': 'test-token'
      };
      return envs[key] || null;
    }
  }
};

// Implementação do CircuitBreaker para testes
class CircuitBreaker {
  constructor() {
    this.failures = 0;
    this.lastFailure = 0;
    this.threshold = 5;
    this.resetTimeout = 300000;
    this.state = 'closed';
  }

  canRequest() {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess() {
    if (this.state === 'half-open') {
      this.state = 'closed';
    }
    this.failures = 0;
  }

  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure
    };
  }
}

// Funções auxiliares para teste
function hasNewMovements(storedDate, newDate, movements = []) {
  if (!newDate) return false;
  if (!storedDate) return true;

  const storedTime = new Date(storedDate).getTime();
  const newTime = new Date(newDate).getTime();

  return newTime > storedTime + 60000;
}

async function withRetry(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) break;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Unknown error in retry operation');
}

// Testes
console.log('🧪 Iniciando testes unitários...\n');

// Teste 1: CircuitBreaker - estado inicial
console.log('1. Teste CircuitBreaker - estado inicial');
const cb1 = new CircuitBreaker();
assert(cb1.canRequest(), 'Deve permitir requests quando o circuito está fechado');
console.log('✅ OK\n');

// Teste 2: CircuitBreaker - abrir após falhas
console.log('2. Teste CircuitBreaker - abrir após falhas');
const cb2 = new CircuitBreaker();
for (let i = 0; i < 4; i++) {
  cb2.recordFailure();
  assert(cb2.canRequest(), 'Deve permitir requests antes do threshold');
}
cb2.recordFailure();
assert(!cb2.canRequest(), 'Deve bloquear requests quando o circuito está aberto');
console.log('✅ OK\n');

// Teste 3: hasNewMovements - sem data armazenada
console.log('3. Teste hasNewMovements - sem data armazenada');
const result1 = hasNewMovements(
  undefined,
  '2024-01-01T10:00:00Z',
  [{ dataHora: '2024-01-01T10:00:00Z', descricao: 'Test' }]
);
assert(result1, 'Deve detectar nova movimentação quando não há data armazenada');
console.log('✅ OK\n');

// Teste 4: hasNewMovements - datas iguais
console.log('4. Teste hasNewMovements - datas iguais');
const result2 = hasNewMovements(
  '2024-01-01T10:00:00Z',
  '2024-01-01T10:00:00Z',
  [{ dataHora: '2024-01-01T10:00:00Z', descricao: 'Test' }]
);
assert(!result2, 'Não deve detectar nova movimentação quando datas são iguais');
console.log('✅ OK\n');

// Teste 5: withRetry - sucesso na primeira tentativa
console.log('5. Teste withRetry - sucesso na primeira tentativa');
let attempts = 0;
const result3 = await withRetry(async () => {
  attempts++;
  return 'success';
});
assert.strictEqual(result3, 'success');
assert.strictEqual(attempts, 1);
console.log('✅ OK\n');

// Teste 6: withRetry - sucesso após retry
console.log('6. Teste withRetry - sucesso após retry');
let attempts2 = 0;
const result4 = await withRetry(async () => {
  attempts2++;
  if (attempts2 < 2) throw new Error('Temporary failure');
  return 'success';
}, 3);
assert.strictEqual(result4, 'success');
assert.strictEqual(attempts2, 2);
console.log('✅ OK\n');

// Teste 7: Deno.env mock
console.log('7. Teste Deno.env mock');
const apiKey = Deno.env.get('DATAJUD_API_KEY');
assert.strictEqual(apiKey, 'test-key', 'Deve retornar a API key mockada');
console.log('✅ OK\n');

console.log('🎉 Todos os testes passaram com sucesso!');
console.log('\n📋 Resumo dos testes:');
console.log('- CircuitBreaker: 2 testes');
console.log('- hasNewMovements: 2 testes');
console.log('- withRetry: 2 testes');
console.log('- Deno.env mock: 1 teste');
console.log('\nTotal: 7 testes aprovados');