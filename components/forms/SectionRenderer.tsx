'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const statusEnum = z.enum(['OK','Ikke OK','IR']);

function buildSchema(fields: any[]) {
  const shape: Record<string, any> = {};
  for (const f of fields) {
    if (f.type === 'status') shape[f.name] = statusEnum.optional();
    else if (f.type === 'text') shape[f.name] = z.string().optional();
    else if (f.type === 'array') shape[f.name] = z.array(z.any()).optional();
    else shape[f.name] = z.any().optional();
  }
  return z.object(shape);
}

export default function SectionRenderer({ sectionKey, fields, initialData, onSave }: {
  sectionKey: string;
  fields: Array<{name: string, type: string, options?: string[]}>;
  initialData?: any;
  onSave: (data: any) => void;
}) {
  const schema = buildSchema(fields);
  const { register, watch, setValue } = useForm({ resolver: zodResolver(schema), defaultValues: initialData || {} });

  useEffect(() => {
    if (initialData) Object.entries(initialData).forEach(([k, v]) => setValue(k as any, v as any));
  }, [initialData, setValue]);

  useEffect(() => {
    const sub = watch((values) => onSave(values as any));
    return () => sub.unsubscribe();
  }, [watch, onSave]);

  return (
    <div className="space-y-3">
      {fields.map((f) => {
        if (f.type === 'status') {
          return (
            <div key={f.name} className="flex items-center gap-3">
              <label className="w-64">{f.name}</label>
              <select className="border p-2 rounded" {...register(f.name)}>
                <option value=""></option>
                <option value="OK">OK</option>
                <option value="Ikke OK">Ikke OK</option>
                <option value="IR">IR</option>
              </select>
            </div>
          );
        }
        if (f.type === 'text') {
          return (
            <div key={f.name} className="space-y-1">
              <label className="block">{f.name}</label>
              <textarea className="w-full border p-2 rounded" rows={4} {...register(f.name)} />
            </div>
          );
        }
        return (
          <div key={f.name}>
            <label className="block">{f.name}</label>
            <input className="w-full border p-2 rounded" {...register(f.name)} />
          </div>
        );
      })}
    </div>
  );
}
