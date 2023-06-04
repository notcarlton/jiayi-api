import Link from 'next/link';
import { IAPIRoute } from '~/app/api/generateDocs';

interface IProps {
  route: IAPIRoute;
  prevPath: string;
}

export function RouteDoc({ route, prevPath }: IProps) {
  return (
    <Link
      href={`${prevPath}/${route.name}`}
      className='px-4 py-2 border-red-800 border-2'
    >
      {route.name}
    </Link>
  );
}
