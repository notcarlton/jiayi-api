import Link from 'next/link';

import globeASCII from './assets/ascii/globe';

export default function Home() {
  return (
    <div className='w-min'>
      <pre>{globeASCII}</pre>
      <p className='text-center w-full'>
        <a href='https://jiayi.software' className='text-pure'>
          jiayi software
        </a>{' '}
        &#x2022;{' '}
        <Link href='/docs' className='text-pure'>
          api docs
        </Link>
      </p>
    </div>
  );
}
