import { Queue } from 'bullmq';
import { CompleteTask } from './schemas';
export declare const jobsQueue: Queue<any, any, string, any, any, string>;
export declare function testRedisConnection(): Promise<boolean>;
export type StagehandTask = CompleteTask;
export declare function addStagehandTask(taskData: StagehandTask): Promise<import("bullmq").Job<any, any, string>>;
//# sourceMappingURL=queue.d.ts.map