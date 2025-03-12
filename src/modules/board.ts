import { getTasks, updateTask, deleteTask } from "./tasks";
import { Task } from "../types";

// Laddar och renderar Scrum Boarden
export async function loadBoard(): Promise<void> {
  let tasks: Task[] = await getTasks();

  // Hämta filter- och sorteringsvärden
  const statusFilter = getSelectValue("filter-status");
  const assignedFilter = getSelectValue("filter-assigned");
  const categoryFilter = getSelectValue("filter-category");
  const sortBy = getSelectValue("sort-by");

  console.log("Filter:", { statusFilter, assignedFilter, categoryFilter, sortBy });

  // **Filtrering**
  if (statusFilter && statusFilter !== "all") {
    tasks = tasks.filter(task => task.status === statusFilter);
  }
  if (assignedFilter && assignedFilter !== "all") {
    tasks = tasks.filter(task => task.assignedTo === assignedFilter);
  }
  if (categoryFilter && categoryFilter !== "all") {
    tasks = tasks.filter(task => task.category === categoryFilter);
  }

  // **Sortering**
  if (sortBy === "timestamp-newest") {
    tasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy === "timestamp-oldest") {
    tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortBy === "title-asc") {
    tasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "title-desc") {
    tasks.sort((a, b) => b.title.localeCompare(a.title));
  }

  console.log("Filtered & sorted tasks:", tasks);

  // Rendera uppgifter i respektive kolumn
  renderTasks(tasks);
}

// Renderar uppgifter i kolumner baserat på status
export function renderTasks(tasks: Task[]): void {
  const todoContainer = document.getElementById("tasks-to-do");
  const inProgressContainer = document.getElementById("tasks-in-progress");
  const doneContainer = document.getElementById("tasks-done");

  if (!todoContainer || !inProgressContainer || !doneContainer) return;

  // Rensa tidigare uppgifter
  todoContainer.innerHTML = "";
  inProgressContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);

    // Lägg uppgiften i rätt kolumn baserat på status
    if (task.status === "to-do") {
      todoContainer.appendChild(taskElement);
    } else if (task.status === "in-progress") {
      inProgressContainer.appendChild(taskElement);
    } else if (task.status === "done") {
      doneContainer.appendChild(taskElement);
    }
  });
}

// Skapar ett HTML-element för en uppgift
function createTaskElement(task: Task): HTMLDivElement {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.draggable = true;
  taskDiv.dataset.taskId = task.id;

  taskDiv.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p><strong>Assigned to:</strong> ${task.assignedTo}</p>
    <p><strong>Category:</strong> ${task.category}</p>
    <p><strong>Created:</strong> ${new Date(task.date).toLocaleString()}</p>
    <div class="task-actions">
      <button class="move-left">⬅️</button>
      <button class="move-right">➡️</button>
      <button class="delete">🗑️</button>
    </div>
  `;

  // Event Listeners för knappar
  taskDiv.querySelector(".move-left")?.addEventListener("click", () => moveTask(task, "left"));
  taskDiv.querySelector(".move-right")?.addEventListener("click", () => moveTask(task, "right"));
  taskDiv.querySelector(".delete")?.addEventListener("click", () => handleDeleteTask(task.id));

  return taskDiv;
}

// Flyttar en uppgift mellan statuskolumnerna
async function moveTask(task: Task, direction: "left" | "right") {
  const statusOrder: Task["status"][] = ["to-do", "in-progress", "done"];
  let currentIndex = statusOrder.indexOf(task.status);

  if (direction === "left" && currentIndex > 0) {
    task.status = statusOrder[currentIndex - 1] as "to-do" | "in-progress" | "done";
  } else if (direction === "right" && currentIndex < statusOrder.length - 1) {
    task.status = statusOrder[currentIndex + 1] as "to-do" | "in-progress" | "done";
  } else {
    return; // Ingen ändring behövs
  }

  await updateTask(task.id, { status: task.status });
  loadBoard(); // Uppdatera boarden
}

// Tar bort en uppgift
async function handleDeleteTask(taskId: string) {
  if (!taskId) {
    console.error("Fel: Task ID saknas!");
    return;
  }

  const confirmDelete = confirm("Är du säker på att du vill ta bort denna uppgift?");
  if (!confirmDelete) return;

  try {
    await deleteTask(taskId);
    console.log(`Task med ID ${taskId} har tagits bort.`);
    loadBoard(); // Uppdatera Scrum Board
  } catch (error) {
    console.error("Fel vid borttagning av task:", error);
  }
}

// Hjälpfunktion för att hämta värde från select-element
function getSelectValue(id: string): string | null {
  return (document.getElementById(id) as HTMLSelectElement | null)?.value || null;
}
