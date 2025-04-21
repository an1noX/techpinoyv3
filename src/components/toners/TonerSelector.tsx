
import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WikiToner } from '@/types/types';
import { Input } from '../ui/input';

interface TonerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  toners: WikiToner[];
  label?: string;
  placeholder?: string;
}

export function TonerSelector({
  value,
  onChange,
  toners,
  label,
  placeholder = "Select a toner"
}: TonerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredToners = toners.filter(toner => 
    toner.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (toner.color && toner.color.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Search toners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredToners.map(toner => (
            <SelectItem key={toner.id} value={toner.id}>
              {toner.brand} {toner.model} ({toner.color})
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
