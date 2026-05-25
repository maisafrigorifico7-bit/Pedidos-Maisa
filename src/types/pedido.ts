export interface Pedido {
  id: string;
  cliente: string;
  itens: string[];
  dataCreacao: Date;
  status: 'pendente' | 'pesado' | 'nota_emitida' | 'enviado' | 'sem_estoque';
  dataAtualizacao: Date;
  notas?: string;
}

export interface PedidoFormData {
  cliente: string;
  itens: string;
  notas?: string;
}
