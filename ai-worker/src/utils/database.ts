import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TaskData {
  title: string;
  description: string;
  agentType: 'ACTION_SCOUT' | 'BROWSER_AUTOMATION' | 'SEARCH_AGENT' | 'PLEX_AGENT' | 'RESEARCH_AGENT' | 'SUMMARY_AGENT';
  taskType: 'SINGLE_RUN' | 'CONTINUOUSLY_RUNNING' | 'RUN_ON_CONDITION' | 'THINKING_RESEARCH' | 'FAILED_TASK_RECOVERY';
  condition?: any;
  goTo?: string[];
  search?: string[];
  actions?: any[];
}

export async function storeTasksInDatabase(scoutId: string, tasks: TaskData[], userId: string = 'temp-user-id') {
  try {
    const storedTasks = [];
    
    for (const task of tasks) {
      const storedTask = await prisma.todo.create({
        data: {
          scoutId: scoutId,
          userId: userId,
          title: task.title,
          description: task.description,
          agentType: task.agentType,
          taskType: task.taskType,
          condition: task.condition || null,
          goTo: task.goTo || [],
          search: task.search || [],
          actions: task.actions || null,
          status: 'PENDING'
        }
      });
      
      storedTasks.push(storedTask);
    }
    
    console.log(`Successfully stored ${storedTasks.length} tasks for scout ${scoutId}`);
    return storedTasks;
    
  } catch (error) {
    console.error('Failed to store tasks in database:', error);
    throw error;
  }
}

export async function getScoutById(scoutId: string) {
  try {
    return await prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        todos: true
      }
    });
  } catch (error) {
    console.error('Failed to get scout:', error);
    throw error;
  }
}

export async function updateTodoStatus(todoId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED', resultData?: any) {
  try {
    return await prisma.todo.update({
      where: { id: todoId },
      data: {
        status,
        resultData: resultData || {},
        lastRunAt: new Date(),
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      }
    });
  } catch (error) {
    console.error('Failed to update todo status:', error);
    throw error;
  }
} 