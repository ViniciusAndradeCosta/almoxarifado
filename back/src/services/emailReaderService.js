import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import prisma from '../database/client.js';

export async function processarEmailsDePedidos() {
  // 1. Criamos uma instância NOVA toda vez que o Cron chamar a função
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    logger: false
  });

  // Proteção para o servidor não "crashar" se o Gmail bloquear temporariamente ou a internet cair
  client.on('error', err => {
    console.error('[E-mail Reader] Aviso de rede no IMAP:', err.message);
  });

  try {
    // 2. Conecta ao Gmail
    await client.connect();
    
    // Abre a Caixa de Entrada (INBOX)
    let lock = await client.getMailboxLock('INBOX');
    try {
      // Procura apenas mensagens Não Lidas com o assunto específico
      const searchCriteria = { seen: false, subject: 'NOVO PEDIDO' };
      const messages = await client.search(searchCriteria);

      if (messages.length === 0) {
        return; // Não há e-mails novos
      }

      for (const seq of messages) {
        // Baixa o e-mail completo
        const message = await client.fetchOne(seq, { source: true });
        const parsed = await simpleParser(message.source);

        const text = parsed.text; // Corpo do e-mail em texto simples
        if (!text) continue;

        // Extrai os dados do e-mail
        const orderData = extrairDadosDoEmail(text);

        if (orderData.items.length > 0) {
           // Grava o pedido no banco
           const createdOrder = await criarPedidoNoBanco(orderData);
           if (createdOrder) {
              // Marca o e-mail como LIDO
              await client.messageFlagsAdd(seq, ['\\Seen']);
              console.log(`[E-mail Reader] Pedido #${createdOrder.id} gerado com sucesso via e-mail!`);
           }
        }
      }
    } finally {
      lock.release();
    }
    // 3. Desloga e encerra a conexão atual
    await client.logout();
  } catch (error) {
    console.error('[E-mail Reader] Erro ao ler e-mails:', error);
  }
}

// A função inteligente que extrai os dados do texto do e-mail
function extrairDadosDoEmail(texto) {
  const lines = texto.split('\n').map(l => l.trim());
  let supplier = '';
  let notes = '';
  let parsingItems = false;
  const items = [];

  for (const line of lines) {
     if (line.toUpperCase().startsWith('FORNECEDOR:')) {
        supplier = line.substring(line.indexOf(':') + 1).trim();
     } else if (line.toUpperCase().startsWith('OBS:')) {
        notes = line.substring(line.indexOf(':') + 1).trim();
     } else if (line.toUpperCase() === 'ITENS:') {
        parsingItems = true; 
     } else if (parsingItems && line.startsWith('-')) {
        
        const parts = line.substring(1).split('|').map(p => p.trim());
        const itemName = parts[0];
        let qty = 1;
        let size = null;

        for (let i = 1; i < parts.length; i++) {
           const partUpper = parts[i].toUpperCase();
           
           if (partUpper.startsWith('QTD:') || partUpper.startsWith('QUANTIDADE:')) {
              const match = partUpper.match(/\d+/); 
              if (match) qty = parseInt(match[0], 10);
           } 
           else if (partUpper.startsWith('TAM:') || partUpper.startsWith('TAMANHO:')) {
              const separador = parts[i].split(':');
              if (separador.length > 1) {
                 size = separador[1].trim();
              }
           }
        }
        if (itemName) items.push({ name: itemName, qty, size });
     }
  }
  return { supplier, notes, items };
}

// Salva no banco de dados usando o Prisma
async function criarPedidoNoBanco(orderData) {
  try {
    const orderItems = [];

    for (const extractedItem of orderData.items) {
       const dbItem = await prisma.item.findFirst({
          where: {
             name: { equals: extractedItem.name, mode: 'insensitive' },
             ...(extractedItem.size ? { size: { equals: extractedItem.size, mode: 'insensitive' } } : {})
          }
       });

       if (dbItem) {
          orderItems.push({
             itemId: dbItem.id,
             itemName: dbItem.name,
             itemType: dbItem.type,
             itemSize: dbItem.size,
             quantity: extractedItem.qty
          });
       } else {
          orderItems.push({
             itemName: extractedItem.name,
             itemSize: extractedItem.size,
             quantity: extractedItem.qty
          });
       }
    }

    if (orderItems.length === 0) return null;

    const newOrder = await prisma.order.create({
       data: {
          orderDate: new Date(),
          supplier: orderData.supplier || null,
          notes: orderData.notes || null,
          status: 'PENDENTE',
          items: {
             create: orderItems
          }
       }
    });
    return newOrder;
  } catch (err) {
     console.error('[E-mail Reader] Erro ao gravar pedido no banco:', err);
     return null;
  }
}