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

  renderInProgressTasks(tasks);
}

// Renderar uppgifter med statusen "in-progress"
export function renderInProgressTasks(tasks: Task[]): void {
  const inProgressContainer = document.getElementById("tasks-in-progress");

  if (!inProgressContainer) return;

  // Töm innehållet i kolumnen för "in-progress"
  inProgressContainer.innerHTML = "";

  // Loopar över alla uppgifter och lägger till de som är "in-progress"
  tasks.forEach((task) => {
    if (task.status === "in-progress") {
      const taskElement = createTaskElement(task);
      inProgressContainer.appendChild(taskElement);

      // Lägg till en klickhändelse för att flytta uppgiften till "done"
      taskElement.addEventListener("click", () => moveToDone(task));
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
  `;

  return taskDiv;
}

// Flytta uppgiften till "done" när den klickas
async function moveToDone(task: Task): Promise<void> {
  // Uppdatera uppgiftens status till "done"
  task.status = "done";
  await updateTask(task.id, { status: task.status });

  // Återrendera boarden så att uppgiften flyttas till rätt kolumn
  loadBoard();
}

// Hjälpfunktion för att hämta värde från select-element
function getSelectValue(id: string): string | null {
  return (document.getElementById(id) as HTMLSelectElement)?.value || null;
}
