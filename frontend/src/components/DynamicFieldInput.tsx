'use client';

import { Trash2, Lock, Eye } from 'lucide-react';

interface DynamicFieldInputProps {
  fieldKey: string;
  fieldValue: string;
  isPublic: boolean;
  onUpdate: (key: string, value: string, isPublic: boolean) => void;
  onRemove: () => void;
}

export default function DynamicFieldInput({
  fieldKey,
  fieldValue,
  isPublic,
  onUpdate,
  onRemove,
}: DynamicFieldInputProps) {
  return (
    <div className="flex flex-col gap-3 p-4 crisis-card border-none bg-lifelink-slate-lighter/50">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Label (e.g. Blood Type)"
          className="crisis-input text-sm bg-lifelink-slate-lighter"
          value={fieldKey}
          onChange={(e) => onUpdate(e.target.value, fieldValue, isPublic)}
        />
        <button
          onClick={onRemove}
          className="p-3 text-white/20 hover:text-lifelink-red transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Value (e.g. O+)"
          className="crisis-input text-sm font-bold bg-lifelink-slate-lighter"
          value={fieldValue}
          onChange={(e) => onUpdate(fieldKey, e.target.value, isPublic)}
        />
        
        <div className="flex items-center bg-lifelink-slate p-1 rounded-lg">
          <button
            onClick={() => onUpdate(fieldKey, fieldValue, !isPublic)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
              isPublic ? 'bg-lifelink-red text-white' : 'text-white/40'
            }`}
          >
            {isPublic ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase">{isPublic ? 'Public' : 'Private'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
