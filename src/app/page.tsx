import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex gap-8'>
      <a href='https://jiayi.software'>Jiayi Software</a>
      <Link href='/docs'>Docs</Link>
    </div>
  );
}
