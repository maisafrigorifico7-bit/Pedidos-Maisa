import { Pedido } from '../types/pedido';

// Criar canal BroadcastChannel para sincronizar em tempo real
export const criarCanalSincronizacao = () => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    window.pedidosChannel = new BroadcastChannel('pedidos-maisa-sync');
  }
};

// Sincronizar estado entre abas
export const sincronizarComBroadcast = (set: any, get: any) => {
  if (typeof window === 'undefined') return;

  // Criar canal se não existir
  if (!window.pedidosChannel) {
    criarCanalSincronizacao();
  }

  const channel = window.pedidosChannel;
  if (!channel) return;

  // Listener para mensagens de outras abas
  channel.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'PEDIDO_ADDED': {
        const pedido = payload as Pedido;
        set((state: any) => ({
          pedidos: [...state.pedidos, pedido],
        }));
        break;
      }

      case 'PEDIDO_UPDATED': {
        const { id, updates } = payload;
        set((state: any) => ({
          pedidos: state.pedidos.map((p: Pedido) =>
            p.id === id ? { ...p, ...updates, dataAtualizacao: new Date() } : p
          ),
        }));
        break;
      }

      case 'PEDIDO_DELETED': {
        const { id } = payload;
        set((state: any) => ({
          pedidos: state.pedidos.filter((p: Pedido) => p.id !== id),
        }));
        break;
      }

      case 'SINCRONIZAR': {
        // Enviar estado atual quando solicitado
        channel.postMessage({
          type: 'ESTADO_ATUAL',
          payload: get().pedidos,
        });
        break;
      }

      case 'ESTADO_ATUAL': {
        // Receber estado de outra aba
        set({
          pedidos: payload,
        });
        break;
      }
    }
  };

  // Solicitar sincronização ao abrir a aba
  window.addEventListener('focus', () => {
    channel.postMessage({ type: 'SINCRONIZAR' });
  });
};

// Salvar pedidos no localStorage/IndexedDB
export const salvarPedidosLocalmente = async (pedidos: Pedido[]) => {
  try {
    if ('indexedDB' in window) {
      const request = indexedDB.open('PedidosMaisa', 1);

      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('pedidos')) {
          db.createObjectStore('pedidos', { keyPath: 'id' });
        }
      };

      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const transaction = db.transaction('pedidos', 'readwrite');
        const store = transaction.objectStore('pedidos');
        store.clear();
        pedidos.forEach((pedido) => store.add(pedido));
      };
    } else {
      // Fallback para localStorage
      localStorage.setItem('pedidos-maisa', JSON.stringify(pedidos));
    }
  } catch (error) {
    console.error('Erro ao salvar pedidos:', error);
  }
};

// Carregar pedidos salvos
export const carregarPedidosLocalmente = async (): Promise<Pedido[]> => {
  try {
    if ('indexedDB' in window) {
      return new Promise((resolve) => {
        const request = indexedDB.open('PedidosMaisa', 1);

        request.onsuccess = (e: any) => {
          const db = e.target.result;
          const transaction = db.transaction('pedidos', 'readonly');
          const store = transaction.objectStore('pedidos');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };
        };
      });
    } else {
      // Fallback para localStorage
      const data = localStorage.getItem('pedidos-maisa');
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    return [];
  }
};

// Estender window com tipos
declare global {
  interface Window {
    pedidosChannel?: BroadcastChannel;
  }
}
