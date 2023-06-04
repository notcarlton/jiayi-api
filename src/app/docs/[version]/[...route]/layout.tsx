import { IAPIRoute, IVersionKey, generateDocs } from '~/app/api/generateDocs';
import { type IParams as IVersionParams } from '../layout';
import { cache } from 'react';

export interface IParams {
  route: string[];
}

export const processSubroutes = cache(
  (routes: IAPIRoute[], parentRoutes?: string[]) => {
    let newData: IParams[] = [];

    for (const i in routes) {
      const route = routes[i];
      const currRoute = [...(parentRoutes ? parentRoutes : []), route.name];
      newData.push({
        route: currRoute,
        // data: route,
      });
      if (route.routes && route.routes.length > 0) {
        const subRoutes = processSubroutes(route.routes, currRoute);
        newData = [...newData, ...subRoutes];
      }
    }

    return newData;
  }
);

export async function generateStaticParams({
  params: { version },
}: {
  params: IVersionParams;
}) {
  // This uses react cache
  const data = await generateDocs();

  let outData: IParams[] = processSubroutes(data[version]);

  return outData;
}

export const dynamicParams = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
