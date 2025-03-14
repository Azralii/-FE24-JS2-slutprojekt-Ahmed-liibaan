import { onValue, push, ref, remove, update } from "firebase/database";
import { db } from "../firebase"; // Firebase-konfigurationen
import { Task } from "../types"; // Task-typen

/**
 * Hämta alla uppgifter från Realtime Database.
 */
export function getTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    onValue(
      ref(db, "/tasks"),
      (snapshot) => {
        const data = snapshot.val();
        const tasks = data
          ? Object.keys(data).map((id) => {
              const task = { id, ...data[id] };

              // Hantera datumformat
              if (!task.date) {
                console.warn(`Task ${id} saknar datum. Använder standardvärde.`);
                task.date = new Date().toISOString();
              } else if (typeof task.date === "number") {
                task.date = new Date(task.date).toISOString();
              } else if (task.date.toDate) {
                task.date = task.date.toDate().toISOString();
              } else {
                console.error(`Ogiltigt datumformat för task ${id}:`, task.date);
                task.date = new Date().toISOString();
              }

              return task;
            })
          : [];
        resolve(tasks);
      },
      { onlyOnce: true }
    );
  });
}

/**
 * Skapa en ny uppgift i databasen.
 */
export async function createTask(task: Task): Promise<void> {
  const newTaskRef = push(ref(db, "/tasks"));
  const taskId = newTaskRef.key;

  if (!taskId) {
    console.error("❌ Kunde inte skapa task-ID!");
    return;
  }

  await update(newTaskRef, { ...task, id: taskId, date: Date.now() });
}

/**
 * Uppdatera en befintlig uppgift i databasen.
 */
export async function updateTask(taskId: string, updatedTask: Partial<Task>): Promise<void> {
  const taskRef = ref(db, `/tasks/${taskId}`);
  await update(taskRef, updatedTask);
}

/**
 * Ta bort en uppgift från databasen.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = ref(db, `/tasks/${taskId}`);
  await remove(taskRef);
  console.log(`Uppgift ${taskId} borttagen`);
}
