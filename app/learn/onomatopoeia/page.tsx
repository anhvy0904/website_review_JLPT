import OnomatopoeiaStudy from '@/components/OnomatopoeiaStudy';
import data from '@/public/data/learning/onomatopoeia/index.json';
import { onomatopoeiaBookSchema } from '@/lib/onomatopoeia';

export const metadata = {
  title: 'Tượng hình – Tượng thanh | Học cùng VuyAnh',
  description: 'Tra cứu từ tượng hình, tượng thanh tiếng Nhật với nghĩa tiếng Việt, cách dùng và hội thoại có furigana.',
};

export default function OnomatopoeiaPage() {
  return <OnomatopoeiaStudy data={{ ...data, ...onomatopoeiaBookSchema.parse(data) }} />;
}
