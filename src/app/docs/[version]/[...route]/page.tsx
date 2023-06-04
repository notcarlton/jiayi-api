import {
  IAPIRoute,
  IVersionKey,
  generateDocs,
  generateSchema,
  getDocsRoute,
} from '~/app/api/generateDocs';
import { type IParams as IVersionParams } from '../layout';
import { IParams } from './layout';
import { z } from 'zod';
import { generateHash } from '~/app/api/utils';
import {
  ArraySchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from './_schemaTypes';
import { RouteDoc } from '~/components/RouteDoc';

export default async function Routes({
  // params: { route, data },
  params: { route, version },
}: {
  params: IParams & IVersionParams;
}) {
  const data = await getDocsRoute(version, route);

  if (!data) return <div>It seems no data for this route was found!</div>;

  const schemas: { key: string; schema: ReturnType<typeof generateSchema> }[] =
    Object.values(data.data.validation_schemas).map(x => ({
      schema: generateSchema(x as z.AnyZodObject),
      key: generateHash(JSON.stringify(x)).toString(),
    }));

  // If type is object, it has properties
  // If type is array, it has items

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h1>{data.name}</h1>
        <p className='indent-2'>{data.data.meta.desc}</p>
      </div>
      <p>
        Path: /api/{version}/{route.join('/')}
      </p>
      {data.routes.length > 0 && (
        <div>
          <h3>Subroutes:</h3>
          <div className='flex w-full max-w-xl gap-2'>
            {data.routes?.map(rt => (
              <RouteDoc
                prevPath={`docs/${version}/${route.join('/')}`}
                key={rt.name}
                route={rt}
              />
            ))}
          </div>
        </div>
      )}
      <div>
        <p>Schemas:</p>
        <div className='ml-4 py-2 flex flex-col gap-2'>
          {schemas.map(({ key, schema }) => {
            return (
              <div
                key={key}
                className='p-4 border-bg-tertiary border-2 w-[max-content]'
              >
                <h1>{schema.title}</h1>
                {schema.type === 'object' && <ObjectSchema data={schema} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
