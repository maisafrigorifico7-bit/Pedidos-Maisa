import { create } from 'zustand';
import { Pedido } from '../types/pedido';
import { sincronizarComBroadcast } from '../utils/sincronizacao';

interface PedidosState {
  pedidos: Pedido[];
  addPedido: (pedido: Pedido) => void;
  updatePedido: (id: string, pedido: Partial<Pedido>) => void;
  deletePedido: (id: string) => void;
  getPedidosPorStatus: (status: Pedido['status']) => Pedido[];
  getPedidoById: (id: string) => Pedido | undefined;
  setPedidos: (pedidos: Pedido[]) => void;
}

export const usePedidosStore = create<PedidosState>((set, get) => {
  // Sincronizar com outras abas
  sincronizarComBroadcast(set, get);

  return {
    pedidos: [],
    
    addPedido: (pedido: Pedido) => {
      set((state) => {
        const newState = {
          pedidos: [...state.pedidos, pedido],
        };
        // Notificar outras abas
        if (typeof window !== 'undefined' && window.pedidosChannel) {
          window.pedidosChannel.postMessage({
            type: 'PEDIDO_ADDED',
            payload: pedido,
          });
        }
        return newState;
      });
    },

    updatePedido: (id: string, updates: Partial<Pedido>) => {
      set((state) => {
        const newState = {
          pedidos: state.pedidos.map((p) =>
            p.id === id ? { ...p, ...updates, dataAtualizacao: new Date() } : p
          ),
        };
        // Notificar outras abas
        if (typeof window !== 'undefined' && window.pedidosChannel) {
          window.pedidosChannel.postMessage({
            type: 'PEDIDO_UPDATED',
            payload: { id, updates },
          });
        }
        return newState;
      });
    },

    deletePedido: (id: string) => {
      set((state) => {
        const newState = {
          pedidos: state.pedidos.filter((p) => p.id !== id),
        };
        // Notificar outras abas
        if (typeof window !== 'undefined' && window.pedidosChannel) {
          window.pedidosChannel.postMessage({
            type: 'PEDIDO_DELETED',
            payload: { id },
          });
        }
        return newState;
      });
    },

    getPedidosPorStatus: (status: Pedido['status']) => {
      return get().pedidos.filter((p) => p.status === status);
    },

    getPedidoById: (id: string) => {
      return get().pedidos.find((p) => p.id === id);
    },

    setPedidos: (pedidos: Pedido[]) => {
      set({ pedidos });
    },
  };
});
