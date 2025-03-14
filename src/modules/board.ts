import { getTasks, updateTask, deleteTask } from "./tasks";
import { Task } from "../types";

export async function loadBoard(): Promise<void> {
  let tasks: Task[] = await getTasks();

  // Hämta filter- och sorteringsvärden
  const statusFilter = getSelectValue("filter-status");
  const assignedFilter = getSelectValue("filter-assigned");
  const categoryFilter = getSelectValue("filter-category");  // Hämta kategori-filter
  const sortBy = getSelectValue("sort-by");

  console.log("Filter:", { statusFilter, assignedFilter, categoryFilter, sortBy });

  // **Filtrering**
  if (statusFilter && statusFilter !== "all") {
    tasks = tasks.filter(task => task.status === statusFilter);
  }

  // Filtrera baserat på tilldelad medlem (om valts)
  if (assignedFilter && assignedFilter !== "all") {
    tasks = tasks.filter(task => task.assignedTo === assignedFilter);
  }

  // Filtrera baserat på kategori (om valts)
  if (categoryFilter && categoryFilter !== "all") {
    tasks = tasks.filter(task => task.category === categoryFilter);  // Filtrera enligt kategori
  }

  // **Sortering**
  if (sortBy === "timestamp-newest") {
    tasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Nyast först
  } else if (sortBy === "timestamp-oldest") {
    tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Äldst först
  } else if (sortBy === "title-ascending") {
    tasks.sort((a, b) => a.title.localeCompare(b.title)); // Stigande ordning
  } else if (sortBy === "title-descending") {
    tasks.sort((a, b) => b.title.localeCompare(a.title)); // Fallande ordning
  }

  console.log("Filtered & sorted tasks:", tasks);

  renderTasks(tasks);
}


// Renderar uppgifter i respektive kolumn
export function renderTasks(tasks: Task[]): void {
  const todoContainer = document.getElementById("tasks-to-do");
  const inProgressContainer = document.getElementById("tasks-in-progress");
  const doneContainer = document.getElementById("tasks-done");

  if (!todoContainer || !inProgressContainer || !doneContainer) return;

  // Töm innehållet i kolumnerna
  todoContainer.innerHTML = "";
  inProgressContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  // Loopar över alla uppgifter och lägger till dem i rätt kolumn
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);

    if (task.status === "to-do") {
      todoContainer.appendChild(taskElement);
    } else if (task.status === "in-progress") {
      inProgressContainer.appendChild(taskElement);
    } else if (task.status === "done") {
      doneContainer.appendChild(taskElement);
    }
  });
}

// Skapar HTML-element för en uppgift
function createTaskElement(task: Task): HTMLDivElement {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.draggable = true;
  taskDiv.dataset.taskId = task.id;

  // Skapa HTML-struktur för uppgiften
  taskDiv.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p><strong>Assigned to:</strong> ${task.assignedTo}</p>
    <p><strong>Category:</strong> ${task.category}</p>
    <p><strong>Created:</strong> ${new Date(task.date).toLocaleString()}</p>
    <div class="task-actions">
      ${
        task.status === "done" // Visa knappar bara om status är "done"
          ? `<button class="done-btn">✔️ Markera som klar</button>
             <button class="delete">🗑️ Ta bort</button>`
          : "" // Om inte "done", visa inga knappar
      }
    </div>
  `;

  // Lägg till event listeners för knapparna
  const deleteButton = taskDiv.querySelector(".delete") as HTMLButtonElement;
  const doneButton = taskDiv.querySelector(".done-btn") as HTMLButtonElement;

  // Ta bort-knappen visas endast om uppgiften är "done"
  if (deleteButton) {
    deleteButton.addEventListener("click", () => handleDeleteTask(task.id));
  }

  // Markera uppgiften som "done" när användaren klickar på "✔️ Markera som klar"
  if (doneButton) {
    doneButton.addEventListener("click", () => markTaskAsDone(task));
  }

  return taskDiv;
}

// Markera uppgiften som "done" endast om den är tilldelad till en teammedlem
async function markTaskAsDone(task: Task) {
  if (!task.assignedTo || task.assignedTo === "Ingen") {
    alert("Denna uppgift kan inte markeras som klar eftersom den inte är tilldelad en teammedlem.");
    return;
  }

  task.status = "done";
  await updateTask(task.id, { status: task.status });
  loadBoard(); // Återrendera uppgifter för att uppdatera listorna
}

// Tar bort en uppgift
async function handleDeleteTask(taskId: string) {
  const confirmDelete = confirm("Är du säker på att du vill ta bort denna uppgift?");
  if (!confirmDelete) return;

  await deleteTask(taskId);
  loadBoard();
}

// Hjälpfunktion för att hämta värde från select-element
function getSelectValue(id: string): string | null {
  return (document.getElementById(id) as HTMLSelectElement)?.value || null;
}
