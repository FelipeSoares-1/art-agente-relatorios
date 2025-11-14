'use client';

import { useEffect, useState } from 'react';

interface TagCategory {
  id: number;
  name: string;
  keywords: string;
  color: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TagsPage() {
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    color: '#3b82f6',
    enabled: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/tag-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const keywordsArray = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const payload = {
        name: formData.name,
        keywords: keywordsArray,
        color: formData.color,
        enabled: formData.enabled
      };

      if (editingId) {
        // Atualizar
        await fetch('/api/tag-categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId })
        });
      } else {
        // Criar
        await fetch('/api/tag-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      // Reset form
      setFormData({ name: '', keywords: '', color: '#3b82f6', enabled: true });
      setEditingId(null);
      setShowNewForm(false);
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category: TagCategory) => {
    const keywordsArray = JSON.parse(category.keywords);
    setFormData({
      name: category.name,
      keywords: keywordsArray.join(', '),
      color: category.color,
      enabled: category.enabled
    });
    setEditingId(category.id);
    setShowNewForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) return;

    try {
      await fetch(`/api/tag-categories?id=${id}`, {
        method: 'DELETE'
      });
      loadCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria');
    }
  };

  const handleToggleEnabled = async (category: TagCategory) => {
    try {
      await fetch('/api/tag-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          enabled: !category.enabled
        })
      });
      loadCategories();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', keywords: '', color: '#3b82f6', enabled: true });
    setEditingId(null);
    setShowNewForm(false);
  };

  const handleReprocessTags = async () => {
    if (!confirm('Deseja re-processar TODOS os artigos com as tags atualizadas?\n\nIsso pode demorar alguns minutos.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reprocess-tags', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Sucesso!\n\n${data.totalUpdated} artigos foram atualizados de ${data.totalProcessed} processados.`);
      } else {
        alert('❌ Erro ao re-processar tags. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao re-processar:', error);
      alert('❌ Erro ao re-processar tags. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏷️ Gerenciamento de Tags
          </h1>
          <p className="text-gray-600">
            Configure palavras-chave para categorizar automaticamente as notícias
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showNewForm ? '✕ Cancelar' : '➕ Nova Categoria'}
          </button>
          
          <button
            onClick={handleReprocessTags}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Processando...' : '🔄 Re-aplicar Tags em Todos os Artigos'}
          </button>
        </div>

        {/* Formulário */}
        {showNewForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Novos Clientes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Palavras-chave (separadas por vírgula)
                </label>
                <textarea
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Ex: novo cliente, conquista, contrato, fechou conta"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite as palavras-chave que identificam esta categoria, separadas por vírgula
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? '💾 Salvar Alterações' : '➕ Criar Categoria'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Lista de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const keywordsArray = JSON.parse(category.keywords);
            return (
              <div
                key={category.id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  !category.enabled ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    {!category.enabled && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Inativa
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {keywordsArray.length} palavra{keywordsArray.length !== 1 ? 's' : ''}-chave:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {keywordsArray.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleToggleEnabled(category)}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    {category.enabled ? '⏸️ Desativar' : '▶️ Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">
              Nenhuma categoria cadastrada ainda
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ➕ Criar primeira categoria
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
