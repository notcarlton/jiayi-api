import { IVersionKey, generateDocs } from '~/app/api/generateDocs';
import { IParams } from './layout';
import { RouteDoc } from '~/components/RouteDoc';

export default async function Version({ params }: { params: IParams }) {
  const data = (await generateDocs())[params.version];

  return (
    <div className='flex flex-col gap-2'>
      <h1>Version {params.version}</h1>
      <div>
        <h3>Routes: </h3>
        <div className='flex w-full max-w-xl gap-2'>
          {data.map(route => (
            <RouteDoc
              prevPath={`docs/${params.version}`}
              key={route.name}
              route={route}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
