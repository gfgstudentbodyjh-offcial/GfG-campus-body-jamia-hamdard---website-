import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit3, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

export default function ContentCrudModule({
  title,
  subtitle,
  items = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onStatusToggle,
  filterOptions = [],
  activeFilter = 'All',
  onFilterChange,
  searchTerm = '',
  onSearchChange,
  renderRow,
  columns = []
}) {
  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-button text-sm font-bold shadow-lg shadow-green-900/20"
        >
          <Plus className="w-4 h-4" /> Create New Record
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
          />
        </div>

        {/* Filter Pills */}
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <Filter className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0" />
            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => onFilterChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === opt
                    ? 'bg-[#2f9e44] text-white'
                    : 'bg-[#161b22] text-gray-400 hover:text-white border border-[#30363d]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Table / Card Container */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading {title}...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold">No records found</p>
            <p className="text-xs text-gray-600 mt-1">Click "Create New Record" to add your first item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0d1117] text-xs uppercase tracking-wider text-gray-400 border-b border-[#30363d]">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-6 py-4 font-semibold">{col}</th>
                  ))}
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {items.map((item) => renderRow(item))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
