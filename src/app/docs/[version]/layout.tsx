import { IAPIDocs, IVersionKey, generateDocs } from '~/app/api/generateDocs';

export interface IParams {
  version: IVersionKey;
}

export async function generateStaticParams(): Promise<IParams[]> {
  const data = await generateDocs();

  return Object.keys(data).map(x => ({
    version: x as IVersionKey,
  }));
}

export const dynamicParams = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
