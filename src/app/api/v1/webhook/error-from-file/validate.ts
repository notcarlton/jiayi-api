import type { IWebhookData } from '../validate';

export { IWebhookData };

// ngl dogwater architecture but its fine
export const schema_string = `Body Type: form-data

  Form Data:  
    file: File (.txt)

  Note: Look up how to upload files using multipart/form-data or smthn like that (its a POST request if that helps)
`;
