const axios = require('axios');

const BASE_URL = 'https://api.kindo.ai/v1';

function getApiKey(options) {
  return options?.apiKey || process.env.KINDO_API_KEY;
}

async function listAgents(options = {}) {
  const apiKey = getApiKey(options);
  const url = `${BASE_URL}/agents`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey }
  });
  return response.data;
}

async function getAgentInfo(agentId, options = {}) {
  if (!agentId) throw new Error('agentId is required');
  const apiKey = getApiKey(options);
  const url = `${BASE_URL}/agents/${agentId}`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey }
  });
  return response.data;
}

async function runAgent(agentId, inputs, options = {}) {
  if (!agentId) throw new Error('agentId is required');
  if (!Array.isArray(inputs)) throw new Error('inputs must be an array');

  const apiKey = getApiKey(options);
  const url = `${BASE_URL}/agents/runs`;
  const payload = { agentId, inputs };

  const runResponse = await axios.post(url, payload, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  const runId = runResponse.data.runId || runResponse.data.id;
  if (!runId) throw new Error('No runId returned by runAgent');

  if (options.poll) {
    return await pollRun(runId, { apiKey, timeout: options.timeout });
  }

  return { runId };
}

async function getRunInfo(runId, options = {}) {
  if (!runId) throw new Error('runId is required');
  const apiKey = getApiKey(options);
  const url = `${BASE_URL}/runs/${runId}`;

  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey }
  });

  return response.data;
}

async function pollRun(runId, { apiKey, timeout = 60000 }) {
  const pollInterval = 2000; // ms
  const maxAttempts = Math.ceil(timeout / pollInterval);
  let attempt = 0;

  while (attempt < maxAttempts) {
    const runInfo = await getRunInfo(runId, { apiKey });

    if (runInfo.status === 'success') {
      return runInfo;
    } else if (runInfo.status === 'error' || runInfo.status === 'failed') {
      throw new Error(`Run failed: ${JSON.stringify(runInfo)}`);
    }

    await new Promise(res => setTimeout(res, pollInterval));
    attempt++;
  }

  throw new Error(`Timeout waiting for runId ${runId} to complete.`);
}

module.exports = {
  listAgents,
  getAgentInfo,
  runAgent,
  getRunInfo
};
