import axios from "axios";
import { env } from "../config/env.js";
import { JUDGE0_LANGUAGE_IDS } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";

function judgeClient() {
  if (!env.judge0.url) {
    throw new ApiError(503, "Judge0 is not configured.");
  }
  return axios.create({
    baseURL: env.judge0.url,
    headers: {
      ...(env.judge0.apiKey ? { "X-RapidAPI-Key": env.judge0.apiKey } : {}),
      ...(env.judge0.host ? { "X-RapidAPI-Host": env.judge0.host } : {})
    },
    timeout: 15000
  });
}

export async function executeCode(code, languageId, stdin, expectedOutput) {
  const client = judgeClient();
  const { data } = await client.post("/submissions?wait=false", {
    source_code: code,
    language_id: languageId,
    stdin,
    expected_output: expectedOutput
  });

  let delay = 500;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    const result = await client.get(`/submissions/${data.token}`);
    if (result.data.status?.id > 2) {
      return {
        verdict: mapVerdict(result.data.status?.description),
        stdout: result.data.stdout,
        stderr: result.data.stderr,
        time: Number(result.data.time ?? 0),
        memory: Number(result.data.memory ?? 0)
      };
    }
    delay *= 2;
  }
  return { verdict: "TLE", time: 0, memory: 0 };
}

export async function getSupportedLanguages() {
  return judgeClient().get("/languages").then((response) => response.data);
}

export async function runAgainstTestCases(code, language, testCases = []) {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) {
    throw new ApiError(422, "Unsupported code language.");
  }
  let passed = 0;
  let time = 0;
  let memory = 0;
  let verdict = "AC";

  for (const testCase of testCases) {
    const result = await executeCode(code, languageId, testCase.input ?? "", testCase.expected ?? testCase.expectedOutput ?? "");
    time += result.time ?? 0;
    memory = Math.max(memory, result.memory ?? 0);
    if (result.verdict === "AC") {
      passed += 1;
    } else {
      verdict = result.verdict;
    }
  }

  return { verdict, passed, total: testCases.length, time, memory };
}

function mapVerdict(description = "") {
  if (/accepted/i.test(description)) return "AC";
  if (/wrong/i.test(description)) return "WA";
  if (/time/i.test(description)) return "TLE";
  if (/memory/i.test(description)) return "MLE";
  if (/compilation/i.test(description)) return "CE";
  return "RE";
}

