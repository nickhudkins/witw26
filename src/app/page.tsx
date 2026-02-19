import { promises as fs } from 'fs';
import path from 'path';
import type { AppData } from '@/lib/types';
import { AppLayout } from '@/components/AppLayout';

export default async function Page() {
  const filePath = path.join(process.cwd(), 'public', 'data.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const data: AppData = JSON.parse(raw);

  return <AppLayout data={data} />;
}
