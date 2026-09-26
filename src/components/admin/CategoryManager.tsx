"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Camera,
  Zap,
  Box,
  Flame,
  Building2,
  Leaf,
  Check,
  X,
} from "lucide-react";
import { Category } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

const availableIcons = [
  { name: "Camera", icon: Camera },
  { name: "Zap", icon: Zap },
  { name: "Box", icon: Box },
  { name: "Sparkles", icon: Sparkles },
  { name: "Flame", icon: Flame },
  { name: "Building2", icon: Building2 },
  { name: "Layers", icon: Layers },
  { name: "Leaf", icon: Leaf },
];

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, prompts } =
    usePromptStore();
  const { showToast } = useToast();

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Sparkles");

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("Sparkles");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || undefined,
      icon: newCatIcon,
      order: categories.length + 1,
    });

    setNewCatName("");
    setNewCatDesc("");
  };

  const startEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
    setEditIcon(cat.icon);
  };

  const saveEdit = (catId: string) => {
    if (!editName.trim()) return;
    updateCategory(catId, {
      name: editName.trim(),
      description: editDesc.trim(),
      icon: editIcon,
    });
    setEditingCatId(null);
  };

  const handleDelete = (catId: string, name: string) => {
    const count = prompts.filter((p) => p.categoryId === catId).length;
    if (
      confirm(
        `Are you sure you want to delete "${name}"? It currently has ${count} associated prompt(s).`
      )
    ) {
      deleteCategory(catId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category List */}
      <div className="lg:col-span-7 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent)]" />
          Active Categories ({categories.length})
        </h3>

        <div className="space-y-2">
          {categories.map((cat) => {
            const isEditing = editingCatId === cat.id;
            const count = prompts.filter((p) => p.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl glass-card bg-[#0c0e15] border border-white/5 space-y-2"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                      />
                      <select
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="px-3 py-1.5 rounded-xl glass-input text-xs"
                      >
                        {availableIcons.map((i) => (
                          <option key={i.name} value={i.name} className="bg-[#0f1117]">
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Category description..."
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="px-3 py-1 rounded-lg glass-pill text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-white text-sm">
                        <span className="p-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <span>{cat.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A7A7A7] font-mono">
                          {count} prompts
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-[#A7A7A7] mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7A7A7] hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg hover:bg-[var(--accent)]/10 text-[#A7A7A7] hover:text-[var(--accent)]"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Category Form */}
      <div className="lg:col-span-5">
        <div className="p-5 rounded-3xl glass-panel bg-[#0d0f17] border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--accent)]" />
            Add New Category
          </h3>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Dark Surrealism"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Brief category summary for collectors..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Icon
              </label>
              <select
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                {availableIcons.map((i) => (
                  <option key={i.name} value={i.name} className="bg-[#0f1117]">
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl btn-accent-gradient text-xs font-semibold"
            >
              Create Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
