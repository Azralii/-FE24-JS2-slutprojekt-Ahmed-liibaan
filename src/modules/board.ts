import { getTasks, updateTask, deleteTask } from "./tasks";
import { Task } from "../types";

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
  } else if (sortBy === "title-ascending") {
    tasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "title-descending") {
    tasks.sort((a, b) => b.title.localeCompare(a.title));
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

  todoContainer.innerHTML = "";
  inProgressContainer.innerHTML = "";
  doneContainer.innerHTML = "";

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
      <button class="move-left">⬅️</button>
      <button class="move-right">➡️</button>
      ${task.status === "done" ? `<button class="delete">🗑️</button>` : ""}
      ${
        task.status !== "done" && task.assignedTo && task.assignedTo !== "Ingen" 
          ? `<button class="done-btn">✔️ Markera som klar</button>` 
          : ""
      }
    </div>
  `;

  // Lägg till event listeners för knapparna
  const moveLeftButton = taskDiv.querySelector(".move-left") as HTMLButtonElement;
  const moveRightButton = taskDiv.querySelector(".move-right") as HTMLButtonElement;
  const deleteButton = taskDiv.querySelector(".delete") as HTMLButtonElement;
  const doneButton = taskDiv.querySelector(".done-btn") as HTMLButtonElement;

  moveLeftButton?.addEventListener("click", () => moveTask(task, "left"));
  moveRightButton?.addEventListener("click", () => moveTask(task, "right"));

  // "Ta bort"-knappen hanteras endast om uppgiften är "done"
  if (deleteButton) {
    deleteButton.addEventListener("click", () => handleDeleteTask(task.id));
  }

  // Hantera markering av uppgift som klar
  if (doneButton) {
    doneButton.addEventListener("click", () => markTaskAsDone(task));
  }

  return taskDiv;
}

// Flyttar en uppgift mellan statuskolumnerna
async function moveTask(task: Task, direction: "left" | "right") {
  const statusOrder: Task["status"][] = ["to-do", "in-progress", "done"];
  let currentIndex = statusOrder.indexOf(task.status);

  if (direction === "left" && currentIndex > 0) {
    task.status = statusOrder[currentIndex - 1];
  } else if (direction === "right" && currentIndex < statusOrder.length - 1) {
    task.status = statusOrder[currentIndex + 1];
  } else {
    return;
  }

  await updateTask(task.id, { status: task.status });
  loadBoard();
}

// Markera uppgiften som "done" endast om tilldelad till en teammedlem
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
