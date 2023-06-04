import path from 'path';
import { z } from 'zod';

import { getDirectories } from './utils';
import { schema } from './v1/webhook/validate';
import { cache } from 'react';
import { generateSchema as genSchem } from '@anatine/zod-openapi';

const API_DIR = path.join(process.cwd(), 'src/app/api/');

export type IVersionKey = `v${number}`;

export interface IAPIDocs {
  [key: IVersionKey]: IAPIRoute[];
}
export interface IAPIRoute {
  name: string;
  routes: IAPIRoute[];
  data: IAPIRouteData;
}

export interface IAPIRouteData {
  meta: IAPIRouteMetaData;
  validation_schemas: {
    schema: z.AnyZodObject;
    [key: string]: z.Schema;
  };
}
export interface IAPIRouteMetaData {
  desc: string;
}

export const generateDocs = cache(async () => {
  let outData: IAPIDocs = {};
  const apiVersions = await getDirectories(API_DIR);

  for (let i in apiVersions) {
    const version = apiVersions[i];
    if (!version.match(/v\d+/))
      throw `\nInvalid API Version (${version})\nExpected: vNUM`;

    const routes = await generateSubroutes(path.join(API_DIR, version));
    outData[version as IVersionKey] = routes;
  }

  return outData;
});

export const getDocsRoute = async (version: IVersionKey, routes: string[]) => {
  const docs = await generateDocs();

  const data = docs[version];

  let doc = data.find(x => x.name == routes[0]);

  if (!doc) return null;

  routes.forEach((route, idx) => {
    if (idx == 0) return;

    if (!doc) return;

    const subDoc = doc.routes?.find(x => x.name == route);
    if (subDoc) doc = subDoc;
  });

  if (!doc) return null;

  return doc;
};

async function generateSubroutes(api_path: string): Promise<IAPIRoute[]> {
  let new_routes: IAPIRoute[] = [];

  const routes = await getDirectories(api_path);
  for (const i in routes) {
    const route = routes[i];

    let newRoute: IAPIRoute = {
      name: route,
      routes: await generateSubroutes(path.join(api_path, route)),
      data: {
        meta: {
          desc: 'Test',
        },
        validation_schemas: {
          schema,
        },
      },
    };

    new_routes.push(newRoute);
  }

  return new_routes;
}

export const generateSchema = (schema: z.AnyZodObject) => {
  const newSchem = genSchem(schema);

  return newSchem as IDocSchemaType;
};

export type IDocSchemaType =
  | IDocSchemaObject
  | IDocSchemaArray
  | IDocSchemaBoolean
  | IDocSchemaString
  | IDocSchemaNumber;

interface IRootDocSchemaType {
  title?: string;
  description?: string;
}

export interface IDocSchemaBoolean extends IRootDocSchemaType {
  type: 'boolean';
}

export interface IDocSchemaString extends IRootDocSchemaType {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  enum?: string[];
  format?: string; // date-time
}

export interface IDocSchemaNumber extends IRootDocSchemaType {
  type: 'number';
  minimum?: number;
  maximum?: number;
}

export interface IDocSchemaObject extends IRootDocSchemaType {
  type: 'object';
  properties: {
    [key: string]: IDocSchemaType;
  };
  required?: (keyof IDocSchemaObject['properties'])[];
}

export interface IDocSchemaArray extends IRootDocSchemaType {
  type: 'array';
  items: IDocSchemaType;
  maxItems?: number;
}
