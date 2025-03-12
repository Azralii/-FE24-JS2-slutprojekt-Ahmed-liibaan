import { onValue, push, ref, remove, update } from "firebase/database";
import { db } from "../firebase";  // Firebase-konfigurationen
import { Task } from "../types";  // Task-typen

/**
 * Hämta alla uppgifter från Realtime Database.
 */
export function getTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    onValue(ref(db, "/tasks"), (snapshot) => {
      const data = snapshot.val();
      const tasks = data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
      resolve(tasks);
    }, { onlyOnce: true });
  });
}

/**
 * Skapa en ny uppgift i databasen.
 */
export async function createTask(task: Task): Promise<void> {
  const newTaskRef = push(ref(db, "/tasks"));
  const taskId = newTaskRef.key; // Hämta det unika Firebase-ID:t

  if (!taskId) {
    console.error("❌ Kunde inte skapa task-ID!");
    return;
  }

  // Säkerställ att alla värden är korrekt definierade
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
