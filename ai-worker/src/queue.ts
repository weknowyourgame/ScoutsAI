import { completeTaskSchema, type CompleteTask } from "./schemas/task";

type QueueBinding = {
  send: (message: unknown) => Promise<void>;
};

export interface QueueEnv {
  SCOUTS_TASK_QUEUE?: QueueBinding;
}

export async function enqueueTask(env: QueueEnv, task: unknown) {
  const parsed = completeTaskSchema.parse(task);

  if (!env.SCOUTS_TASK_QUEUE) {
    return {
      success: false,
      queued: false,
      localOnly: true,
      message: "SCOUTS_TASK_QUEUE binding is not configured.",
      task: parsed,
    };
  }

  await env.SCOUTS_TASK_QUEUE.send(parsed);
  return {
    success: true,
    queued: true,
    todoId: parsed.todoId,
  };
}

export function normalizeQueueTask(task: unknown): CompleteTask {
  return completeTaskSchema.parse(task);
}
