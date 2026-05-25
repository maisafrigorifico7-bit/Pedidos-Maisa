import React, { useState } from 'react';
import { usePedidosStore } from '../store/pedidosStore';
import { Pedido } from '../types/pedido';
import { ClipboardPaste, Send } from 'lucide-react';

export const FormPedido: React.FC = () => {
  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState('');
  const [notas, setNotas] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addPedido } = usePedidosStore();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!cliente.trim() || !itens.trim()) {
      alert('Por favor, preencha cliente e itens');
      return;
    }

    setIsLoading(true);

    try {
      const novoPedido: Pedido = {
        id: Date.now().toString(),
        cliente: cliente.trim(),
        itens: itens
          .split('\n')
          .map((i) => i.trim())
          .filter((i) => i),
        dataCreacao: new Date(),
        dataAtualizacao: new Date(),
        status: 'pendente',
        notas: notas.trim() || undefined,
      };

      addPedido(novoPedido);

      // Limpar formulário
      setCliente('');
      setItens('');
      setNotas('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Tentar extrair cliente e itens do texto copiado
      const linhas = text.split('\n').filter((l) => l.trim());

      if (linhas.length > 0) {
        setCliente(linhas[0]);
        setItens(linhas.slice(1).join('\n'));
      }
    } catch (error) {
      alert('Não foi possível acessar a área de transferência');
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground p-4 border-rose-200 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-rose-900 flex items-center gap-1.5">
          <ClipboardPaste size={16} />
          Colar pedido do WhatsApp
        </label>
        <button
          onClick={handlePaste}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md px-3 h-7 text-xs text-rose-700"
          type="button"
        >
          <ClipboardPaste size={14} />
          Colar e preencher
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-rose-900 mb-1">Cliente</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nome do cliente"
            className="flex w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-rose-900 mb-1">Itens do pedido</label>
          <textarea
            value={itens}
            onChange={(e) => setItens(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex:\n10kg toucinho picado\n5kg costela\n7 dias - eliane"
            rows={4}
            className="flex w-full rounded-md border border-input px-3 py-2 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm resize-y font-mono text-sm leading-relaxed bg-rose-50/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-rose-900 mb-1">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observações especiais..."
            rows={2}
            className="flex w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 gap-2">
        <p className="text-[11px] text-gray-500">
          Dica: <kbd className="px-1 bg-rose-100 rounded">Ctrl</kbd>+
          <kbd className="px-1 bg-rose-100 rounded">Enter</kbd> pra salvar
        </p>
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-semibold h-9 shadow-md shadow-rose-600/20"
        >
          <Send size={16} />
          {isLoading ? 'Salvando...' : 'Salvar pedido'}
        </button>
      </div>
    </div>
  );
};
