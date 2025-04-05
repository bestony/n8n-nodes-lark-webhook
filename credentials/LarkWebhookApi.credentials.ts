import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LarkWebhookApi implements ICredentialType {
	name = 'larkWebhookApi';
	displayName = 'Lark WebHook API';
	documentationUrl = "https://github.com/bestony/n8n-nodes-lark-webhook?tab=readme-ov-file#credentials";
	properties: INodeProperties[] = [
		{
			displayName: 'Webhook URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
		}
	];
}
