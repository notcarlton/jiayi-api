import Link from 'next/link';
import { redirect } from 'next/navigation';
export default function Home() {
  return (
    <div style={{ display: 'flex', gap: '2em' }}>
      <a href='https://jiayi.software'>Jiayi Software</a>
      <Link href='/docs'>Docs</Link>
    </div>
  );
}
