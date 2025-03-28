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

/**
 * Hämta alla medlemmar från Firebase Realtime Database.
 */
export function getMembers(): Promise<{
  roles: any; name: string 
}[]> {
  return new Promise((resolve) => {
    onValue(
      ref(db, "/members"), // Se till att "/members" är rätt sökväg i din databas
      (snapshot) => {
        const data = snapshot.val();
        const members = data
          ? Object.keys(data).map((id) => ({ id, ...data[id] }))
          : [];
        resolve(members);
      },
      { onlyOnce: true }
    );
  });
}
/**
 * Tilldela en uppgift till en användare och uppdatera status.
 */
 export async function assignTask(taskId: string, assignedTo: string, category: string): Promise<boolean> {
  const members = await getMembers();
  const selectedMember = members.find(m => m.name === assignedTo);

  if (selectedMember && selectedMember.roles.includes(category)) {
    await updateTask(taskId, { assignedTo, status: "in-progress" });
    return true;
  } else {
    return false;
  }
}