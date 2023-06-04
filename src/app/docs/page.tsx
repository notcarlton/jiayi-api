import Link from 'next/link';
import { generateDocs } from '~/api/generateDocs';

export default async function Docs() {
  const data = await generateDocs();

  return (
    <div>
      {Object.keys(data).map(version => (
        <Link key={version} href={`/docs/${version}`}>
          <p>{version}</p>
        </Link>
      ))}
    </div>
  );
}
