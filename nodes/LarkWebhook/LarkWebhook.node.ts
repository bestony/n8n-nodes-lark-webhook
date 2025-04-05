import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios from 'axios';


export class LarkWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lark WebHook',
		icon: 'file:LarkWebhook.svg',
		name: 'larkWebhook',
		group: ['transform'],
		version: 1,
		description: 'Lark WebHook Node',
		defaults: {
			name: 'Lark WebHook',
		},

		credentials: [
			{
				name: 'larkWebhookApi',
				required: true,
			},
		],
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Send Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Post',
						value: 'post',
					},
					{
						name: 'Card',
						value: 'card',
					},
					{
						name: 'Markdown',
						value: 'markdown',
					}
				],
				default: 'text',
				placeholder: 'the type of message to send',
				description: 'The type of message to send'
			},
			{
				displayName: 'Send Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				requiresDataPath: 'multiple',
				default: '',
				placeholder: 'the content of the message to send',
				displayOptions: {
					show: {
						type: ['text', 'markdown'],
					},
				},
			},
			{
				displayName: 'JSON Content',
				name: 'json',
				type: 'json',
				default: '',
				requiresDataPath: 'multiple',
				placeholder: 'the content of the message to send',
				displayOptions: {
					show: {
						type: ['post', 'card'],
					},
				},
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;

		const credentials = await this.getCredentials('larkWebhookApi');
		if (credentials === undefined) {
			throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
		}

		const { apiUrl } = credentials as { apiUrl: string };

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];
				const type = this.getNodeParameter('type', itemIndex) as string;

				let resp;
				let others;

				if (type == "text") {
					const content = this.getNodeParameter('content', itemIndex) as string;
					resp = await axios.post(apiUrl, {
						"msg_type": "text",
						"content": {
							"text": content
						}
					});
				}

				if (type == "post") {
					const json = this.getNodeParameter('json', itemIndex) as string;
					others = json
					resp = await axios.post(apiUrl, {
						"msg_type": "post",
						"content": {
							"post": JSON.parse(json)
						}
					});
				}

				if (type == "card") {
					const json = this.getNodeParameter('json', itemIndex) as string;
					others = json
					resp = await axios.post(apiUrl, {
						"msg_type": "interactive",
						"card": JSON.parse(json)
					})
				}

				if (type == "markdown") {
					const content = this.getNodeParameter('content', itemIndex) as string;
					resp = await axios.post(apiUrl, {
						"msg_type": "interactive",
						"card": {
							"schema": "2.0",
							"body": {
								"elements": [
									{
										"tag": "markdown",
										"content": content
									}
								]
							}
						}
					});
				}

				item.json.response = {
					//@ts-ignore
					"status": resp.status,
					//@ts-ignore
					"headers": resp.headers,
					//@ts-ignore
					"data": resp.data,
					"others": others
				}
			} catch (error) {

				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return [items];
	}

}
