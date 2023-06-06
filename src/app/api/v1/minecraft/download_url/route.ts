import { NextRequest, NextResponse } from 'next/server';
import { schema, ISchema } from './validate';

import { minify } from 'xml-minifier';

import { NextApiResponse } from 'next';
import { IAPIRouteMetaData } from '~/app/api/generateDocs';
import { XMLParser } from 'fast-xml-parser';

const _downloadUrl =
  'https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured';

const _soap = 'http://www.w3.org/2003/05/soap-envelope';
const _addressing = 'http://www.w3.org/2005/08/addressing';
const _secext =
  'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd';
const _secutil =
  'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd';
const _updateService =
  'http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService';
const _updateAuth =
  'http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization';

export async function GET(req: NextRequest, res: NextApiResponse) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const urlSearchParams = new URLSearchParams(req.nextUrl.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    return NextResponse.json(
      {
        message: 'Invalid request',
        errors: result.error.issues,
      },
      {
        status: 400,
      }
    );
  }

  const update_id =
    result.data.update_id ||
    //                                              v Can safely ignore because zod will validate this
    (await generateUpdateId(result.data.version || '', result.data.arch));

  try {
    if (!update_id) throw new Error('Version not found');

    const xml = GenerateXML(update_id || '');

    const data = await fetch(_downloadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml',
      },
      body: minify(xml),
    });

    if (!data.ok) throw new Error('Failed to fetch');

    const parser = new XMLParser();
    let dataObject = parser.parse(await data.text());

    const result =
      dataObject['s:Envelope']['s:Body']['GetExtendedUpdateInfo2Response'][
        'GetExtendedUpdateInfo2Result'
      ];
    if (!result) throw new Error('No data found');

    const url = result['FileLocations']['FileLocation'].find((x: any) =>
      x['Url'].startsWith('http://tlu.dl.delivery.mp.microsoft.com/')
    );

    if (!url && !url['Url']) throw new Error('No url found');

    return NextResponse.json(
      {
        success: true,
        url: url['Url'],
      },
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}

function GenerateXML(update_id: string) {
  const now = new Date(Date.now());
  let fiveMinFuture = new Date(now);
  fiveMinFuture.setMinutes(fiveMinFuture.getMinutes() + 5);
  return `
<s:Envelope xmlns:a="${_addressing}" xmlns:s="${_soap}">
	<s:Header>
		<a:Action s:mustUnderstand="1">${_updateService}/GetExtendedUpdateInfo2</a:Action>
		<a:MessageID>urn:uuid:5754a03d-d8d5-489f-b24d-efc31b3fd32d</a:MessageID>
		<a:To s:mustUnderstand="1">${_downloadUrl}</a:To>
		<o:Security s:mustUnderstand="1" xmlns:o="${_secext}">
			<Timestamp xmlns="${_secutil}">
				<Created>${now.toISOString()}</Created>
				<Expires>${fiveMinFuture.toISOString()}</Expires>
			</Timestamp>
			<wuws:WindowsUpdateTicketsToken wsu:id="ClientMSA" xmlns:wsu="${_secutil}" xmlns:wuws="${_updateAuth}">
				<TicketType Name="MSA" Version="1.0" Policy="MBI_SSL" />
				<TicketType Name="AAD" Version="1.0" Policy="MBI_SSL"></TicketType>
			</wuws:WindowsUpdateTicketsToken>
		</o:Security>
	</s:Header>
	<s:Body>
		<GetExtendedUpdateInfo2 xmlns="${_updateService}">
			<updateIDs>
				<UpdateIdentity>
					<UpdateID>${update_id}</UpdateID>
					<RevisionNumber>1</RevisionNumber>
				</UpdateIdentity>
			</updateIDs>
			<infoTypes>
				<XmlUpdateFragmentType>FileUrl</XmlUpdateFragmentType>
			</infoTypes>
			<deviceAttributes>E:BranchReadinessLevel=CBB&amp;DchuNvidiaGrfxExists=1&amp;ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&amp;CurrentBranch=rs4_release&amp;DataVer_RS5=1942&amp;FlightRing=Retail&amp;AttrDataVer=57&amp;InstallLanguage=en-US&amp;DchuAmdGrfxExists=1&amp;OSUILocale=en-US&amp;InstallationType=Client&amp;FlightingBranchName=&amp;Version_RS5=10&amp;UpgEx_RS5=Green&amp;GStatus_RS5=2&amp;OSSkuId=48&amp;App=WU&amp;InstallDate=1529700913&amp;ProcessorManufacturer=GenuineIntel&amp;AppVer=10.0.17134.471&amp;OSArchitecture=AMD64&amp;UpdateManagementGroup=2&amp;IsDeviceRetailDemo=0&amp;HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&amp;IsFlightingEnabled=0&amp;DchuIntelGrfxExists=1&amp;TelemetryLevel=1&amp;DefaultUserRegion=244&amp;DeferFeatureUpdatePeriodInDays=365&amp;Bios=Unknown&amp;WuClientVer=10.0.17134.471&amp;PausedFeatureStatus=1&amp;Steam=URL%3Asteam%20protocol&amp;Free=8to16&amp;OSVersion=10.0.17134.472&amp;DeviceFamily=Windows.Desktop</deviceAttributes>
		</GetExtendedUpdateInfo2>
	</s:Body>
</s:Envelope>`;
}

type IW10Meta = Record<
  `${number}.${number}.${number}.${number}`,
  IW10VersionMeta
>;
interface IW10VersionMeta {
  Version: string;
  Archs: IW10Archs;
}
interface IW10Archs {
  x64?: IW10ArchData;
  x86?: IW10ArchData;
  arm?: IW10ArchData;
}
interface IW10ArchData {
  FileName: string;
  Hashes: IW10Hashes;
  UpdateIds: string[];
}

interface IW10Hashes {
  MD5: string;
  SHA256: string;
}

async function generateUpdateId(version: string, arch: ISchema['arch']) {
  const data = (await fetch(
    'https://raw.githubusercontent.com/MinecraftBedrockArchiver/Metadata/master/w10_meta.json',
    { next: { revalidate: 24 * 60 * 60 * 1000 } } // Every day
  ).then(res => res.json())) as IW10Meta;

  const versionKey = Object.keys(data)
    .reverse()
    .find(x => x.startsWith(version));
  if (!versionKey) return null;

  const versionData = data[versionKey as keyof IW10Meta];

  const archKey = Object.keys(versionData.Archs).find(x => x == arch);
  if (!archKey) return null;

  const updateIds = versionData.Archs[archKey as keyof IW10Archs]?.UpdateIds;
  if (!updateIds || updateIds.length === 0) return null;

  return updateIds[updateIds.length - 1];
}

export const meta: IAPIRouteMetaData = {
  desc: 'Returns a download url using update_id or version',
};
