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
    color: '#dc2626',
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
        await fetch('/api/tag-categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId })
        });
      } else {
        await fetch('/api/tag-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setFormData({ name: '', keywords: '', color: '#dc2626', enabled: true });
      setEditingId(null);
      setShowNewForm(false);
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category: TagCategory) => {
    // Converter keywords para string limpa
    let keywordsString = '';
    
    if (Array.isArray(category.keywords)) {
      // Se já é array, apenas junta com vírgula
      keywordsString = category.keywords.join(', ');
    } else if (typeof category.keywords === 'string') {
      try {
        // Se é string, tenta parsear como JSON
        const parsed = JSON.parse(category.keywords);
        if (Array.isArray(parsed)) {
          keywordsString = parsed.join(', ');
        } else {
          keywordsString = category.keywords;
        }
      } catch {
        // Se falhar o parse, usa a string diretamente
        keywordsString = category.keywords;
      }
    }

    setFormData({
      name: category.name,
      keywords: keywordsString,
      color: category.color,
      enabled: category.enabled
    });
    setEditingId(category.id);
    setShowNewForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) return;

    try {
      await fetch('/api/tag-categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      loadCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', keywords: '', color: '#dc2626', enabled: true });
    setEditingId(null);
    setShowNewForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">🏷️ Categorias de Tags</h2>
          <p className="text-gray-600 text-lg">Defina e gerencie as categorias de palavras-chave para classificar notícias</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            {(showNewForm || editingId) && (
              <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 p-6 sticky top-24">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? '✏️ Editar Tag' : '➕ Nova Tag'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome da Categoria
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Tecnologia"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none text-gray-900 placeholder:text-gray-600 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Palavras-chave (separadas por vírgula)
                    </label>
                    <textarea
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="tech, inteligência artificial, startup..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none h-24 text-gray-900 placeholder:text-gray-600 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cor de Identificação
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none text-sm text-gray-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded cursor-pointer"
                    />
                    <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                      Ativa
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                      {editingId ? '💾 Atualizar' : '✅ Criar'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!showNewForm && !editingId && (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition text-lg sticky top-24"
              >
                ➕ Criar Nova Tag
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border-l-4 border-red-600 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📋 Tags Cadastradas ({categories.length})</h3>

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Carregando categorias...</p>
                </div>
              )}

              {!loading && categories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Nenhuma categoria cadastrada ainda.</p>
                  <p className="text-gray-500">Clique no botão acima para criar a primeira categoria.</p>
                </div>
              )}

              {!loading && categories.length > 0 && (
                <div className="space-y-4">
                  {categories.map((category) => {
                    // Processar keywords de forma mais robusta
                    let keywordsList: string[] = [];
                    
                    if (Array.isArray(category.keywords)) {
                      keywordsList = category.keywords;
                    } else if (typeof category.keywords === 'string') {
                      try {
                        // Tenta parsear como JSON primeiro
                        const parsed = JSON.parse(category.keywords);
                        if (Array.isArray(parsed)) {
                          keywordsList = parsed;
                        } else {
                          // Se não for array, trata como string separada por vírgula
                          keywordsList = category.keywords.split(',').map((k: string) => k.trim()).filter(k => k.length > 0);
                        }
                      } catch {
                        // Se falhar o parse, trata como string separada por vírgula
                        keywordsList = category.keywords.split(',').map((k: string) => k.trim()).filter(k => k.length > 0);
                      }
                    }

                    return (
                      <div
                        key={category.id}
                        className="p-5 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition group"
                      >
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <h4 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition">
                                {category.name}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {keywordsList.slice(0, 3).map((kw, i) => (
                                <span
                                  key={i}
                                  className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                                >
                                  {kw}
                                </span>
                              ))}
                              {keywordsList.length > 3 && (
                                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                  +{keywordsList.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {category.enabled ? (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                ✅ Ativa
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                ⊘ Inativa
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(category)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition"
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
