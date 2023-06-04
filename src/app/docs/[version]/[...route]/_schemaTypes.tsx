import clsx from 'clsx';
import {
  IDocSchemaArray,
  IDocSchemaBoolean,
  IDocSchemaNumber,
  IDocSchemaObject,
  IDocSchemaString,
} from '~/app/api/generateDocs';

export function StringSchema({ data }: { data: IDocSchemaString }) {
  return (
    <div>
      string
      {data.minLength !== undefined && ` | min: ${data.minLength}`}
      {data.maxLength !== undefined && ` | max: ${data.maxLength}`}
      {data.enum && ` | [${data.enum.join(', ')}]`}
      {data.format && ` | format: ${data.format}`}
    </div>
  );
}

export function NumberSchema({ data }: { data: IDocSchemaNumber }) {
  return (
    <div>
      number
      {data.minimum !== undefined && ` | min: ${data.minimum}`}
      {data.maximum !== undefined && ` | max: ${data.maximum}`}
    </div>
  );
}

export function BooleanSchema({ data }: { data: IDocSchemaBoolean }) {
  return <div>bool</div>;
}

export function ArraySchema({ data }: { data: IDocSchemaArray }) {
  return (
    <div className='my-2 p-2 border-bg-secondary border-2 w-[max-content]'>
      [
      {(() => {
        switch (data.items.type) {
          case 'string':
            return <StringSchema data={data.items} />;
          case 'number':
            return <NumberSchema data={data.items} />;
          case 'boolean':
            return <BooleanSchema data={data.items} />;
          case 'array':
            return <ArraySchema data={data.items} />;
          case 'object':
            return <ObjectSchema data={data.items} prevKey={`${data.title}`} />;
          default:
            null;
        }
      })()}
      ]
    </div>
  );
}
export function ObjectSchema({
  data,
  prevKey = '',
}: {
  data: IDocSchemaObject;
  prevKey?: string;
}) {
  return (
    <div className='ml-4'>
      {Object.entries(data.properties).map(([key, value]) => {
        return (
          <div
            key={prevKey + key}
            className={clsx('gap-2', {
              ['flex']: value.type !== 'object',
              ['mb-4']: value.type === 'object',
            })}
          >
            <h1>{key}:</h1>
            {(() => {
              switch (value.type) {
                case 'string':
                  return <StringSchema data={value} />;
                case 'number':
                  return <NumberSchema data={value} />;
                case 'boolean':
                  return <BooleanSchema data={value} />;
                case 'array':
                  return <ArraySchema data={value} />;
                case 'object':
                  return <ObjectSchema data={value} prevKey={prevKey + key} />;
              }
            })()}
          </div>
        );
      })}
    </div>
  );
}