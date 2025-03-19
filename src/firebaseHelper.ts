// firebaseHelper.ts
import { ref, get } from "firebase/database";
import { db } from "./firebase"; // Importera db från firebase.ts

// Definiera typer för medlemmar och uppgifter för TypeScript
interface Member {
  name: string;
}

interface Task {
  name: string;
  assigneeId: string;
}

// Funktion för att hämta alla medlemmar
export function getMembers() {
  const membersRef = ref(db, 'members'); // Hänvisar till 'members' i din databas
  get(membersRef).then((snapshot) => {
    if (snapshot.exists()) {
      const members = snapshot.val() as { [key: string]: Member };
      // Uppdatera select-menyn med medlemmarna
      updateAssigneeFilter(members);
    } else {
      console.log("Inga medlemmar hittades");
    }
  }).catch((error) => {
    console.error('Fel vid hämtning av medlemmar:', error);
  });
}

// Funktion för att uppdatera filter med medlemmar i select-menyn
function updateAssigneeFilter(members: { [key: string]: Member }) {
  const selectElement = document.getElementById('assignee-filter') as HTMLSelectElement;
  selectElement.innerHTML = ''; // Rensa tidigare alternativ

  // Lägg till ett alternativ för varje medlem
  for (const memberId in members) {
    const option = document.createElement('option');
    option.value = memberId;  // Medlemmens ID
    option.textContent = members[memberId].name;  // Medlemmens namn
    selectElement.appendChild(option);
  }
}

// Funktion för att filtrera uppgifter baserat på tilldelad medlem
export function filterTasksByAssignee(assigneeId: string) {
  const tasksRef = ref(db, 'tasks'); // Hänvisar till 'tasks' i din databas
  get(tasksRef).then((snapshot) => {
    if (snapshot.exists()) {
      const tasks = snapshot.val() as { [key: string]: Task };
      const filteredTasks: Task[] = [];

      // Filtrera uppgifter som är tilldelade den valda medlemmen
      for (const taskId in tasks) {
        if (tasks[taskId].assigneeId === assigneeId) {
          filteredTasks.push(tasks[taskId]);
        }
      }

      // Uppdatera visningen av uppgifter baserat på filtrerade uppgifter
      updateTaskList(filteredTasks);
    } else {
      console.log("Inga uppgifter hittades");
    }
  }).catch((error) => {
    console.error('Fel vid filtrering av uppgifter:', error);
  });
}

// Funktion för att uppdatera listan med uppgifter på webbsidan
function updateTaskList(tasks: Task[]) {
  const taskListElement = document.getElementById('task-list');
  if (taskListElement) {
    taskListElement.innerHTML = ''; // Rensa tidigare uppgifter

    tasks.forEach((task) => {
      const taskElement = document.createElement('div');
      taskElement.textContent = `${task.name} - Tilldelad: ${task.assigneeId}`;
      taskListElement.appendChild(taskElement);
    });
  }
}
