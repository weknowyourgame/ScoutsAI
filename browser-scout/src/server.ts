import http, { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { completeTaskSchema } from './schemas/types.js';
import { StagehandExecutor } from './utils/stagehand-executor.js';

const PORT = parseInt(process.env.PORT || '3002');

function sendJson(res: ServerResponse, status: number, body: unknown) {
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<any> {
	return new Promise((resolve, reject) => {
		let data = '';
		req.on('data', chunk => { data += chunk; });
		req.on('end', () => {
			try {
				const json = data ? JSON.parse(data) : {};
				resolve(json);
			} catch (e) {
				reject(e);
			}
		});
		req.on('error', reject);
	});
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
	try {
		if (!req.url || !req.method) {
			return sendJson(res, 400, { error: 'Bad Request' });
		}

		const url = new URL(req.url, `http://localhost:${PORT}`);

		// Health check
        
		if (req.method === 'GET' && url.pathname === '/health') {
			return sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
		}

		// Execute a browser automation task
		if (req.method === 'POST' && url.pathname === '/execute') {
			const body = await readJson(req);
			// Validate input
			const parsed = completeTaskSchema.safeParse(body);
			if (!parsed.success) {
				return sendJson(res, 400, { error: 'Invalid task data', details: parsed.error.flatten() });
			}

			const executor = new StagehandExecutor();
			const result = await executor.executeTask(parsed.data);
			return sendJson(res, 200, result);
		}

		return sendJson(res, 404, { error: 'Not Found' });
	} catch (error) {
		return sendJson(res, 500, { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' });
	}
});

server.listen(PORT, () => {
	console.log(`Browser Scout HTTP server listening on port ${PORT}`);
});

export default server;


