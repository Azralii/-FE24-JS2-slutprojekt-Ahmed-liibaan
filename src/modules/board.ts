import { getTasks, updateTask, deleteTask, getMembers } from "./tasks";
import { Task } from "../types";

// Laddar uppgifter och renderar dem på tavlan
export async function loadBoard(): Promise<void> {
  let tasks: Task[] = await getTasks(); // Hämta alla uppgifter
  let members = await getMembers(); // Hämta alla medlemmar för tilldelning

  // Uppdatera dropdown-menyn med medlemmar för filtrering
  updateMemberDropdown(members);

  // Hämta filter- och sorteringsvärden från användarens val
  const statusFilter = getSelectValue("filter-status");
  const assignedFilter = getSelectValue("filter-assigned");
  const categoryFilter = getSelectValue("filter-category");
  const sortBy = getSelectValue("sort-by");

  console.log("Filter values:", { statusFilter, assignedFilter, categoryFilter, sortBy });

  // **Filtrering av uppgifter**
  if (statusFilter && statusFilter !== "all") {
    tasks = tasks.filter(task => task.status === statusFilter);
  }

  if (assignedFilter && assignedFilter !== "all") {
    tasks = tasks.filter(task => task.assignedTo === assignedFilter);
  }

  if (categoryFilter && categoryFilter !== "all") {
    tasks = tasks.filter(task => task.category === categoryFilter);
  }

  // **Sortering av uppgifter**
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

  // Rendera uppgifterna på tavlan
  renderTasks(tasks, members);
}

// Uppdaterar dropdown-menyn för att välja tilldelad medlem
function updateMemberDropdown(members: { name: string }[]): void {
  const assignedFilter = document.getElementById("filter-assigned") as HTMLSelectElement;
  if (assignedFilter) {
    assignedFilter.innerHTML = `<option value="all">Alla</option>`;
    members.forEach(member => {
      const option = document.createElement("option");
      option.value = member.name;
      option.textContent = member.name;
      assignedFilter.appendChild(option);
    });
  }
}

// Renderar uppgifter i respektive kolumn: To Do, In Progress, Done
export function renderTasks(tasks: Task[], members: { name: string }[]): void {
  const todoContainer = document.getElementById("tasks-to-do");
  const inProgressContainer = document.getElementById("tasks-in-progress");
  const doneContainer = document.getElementById("tasks-done");

  if (!todoContainer || !inProgressContainer || !doneContainer) return;

  todoContainer.innerHTML = "";
  inProgressContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task, members);

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
function createTaskElement(task: Task, members: { name: string }[]): HTMLDivElement {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.draggable = true;
  taskDiv.dataset.taskId = task.id;

  let assignedSection = `<p><strong>Assigned to:</strong> ${task.assignedTo}</p>`;

  // Om uppgiften är i "to-do", visa en dropdown för att välja en person
  if (task.status === "to-do") {
    assignedSection = `
      <label><strong>Assign to:</strong>
        <select class="assign-select">
          <option value="">Välj person</option>
          ${members.map(member => `<option value="${member.name}">${member.name}</option>`).join("")}
        </select>
      </label>
    `;
  }

  // Skapa HTML-struktur för uppgiften
  taskDiv.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    ${assignedSection}
    <p><strong>Category:</strong> ${task.category}</p>
    <p><strong>Created:</strong> ${new Date(task.date).toLocaleString()}</p>
    <div class="task-actions">
      <button class="move-left">⬅️</button>
      <button class="move-right">➡️</button>
      ${task.status === "done" ? `<button class="delete">🗑️</button>` : ""}
      ${
        task.status === "in-progress" && task.assignedTo && task.assignedTo !== "Ingen" 
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
  const assignSelect = taskDiv.querySelector(".assign-select") as HTMLSelectElement;

  moveLeftButton?.addEventListener("click", () => moveTask(task, "left"));
  moveRightButton?.addEventListener("click", () => moveTask(task, "right"));

  if (deleteButton) {
    deleteButton.addEventListener("click", () => handleDeleteTask(task.id));
  }

  if (doneButton) {
    doneButton.addEventListener("click", () => markTaskAsDone(task));
  }

  // Markera en uppgift som klar
  async function markTaskAsDone(task: Task) {
    task.status = "done";
    await updateTask(task.id, { status: "done" });
    loadBoard();
  }

  // Hantera när en person väljs från dropdown-menyn
  if (assignSelect) {
    assignSelect.addEventListener("change", async (event) => {
      const selectedMember = (event.target as HTMLSelectElement).value;
      if (selectedMember) {
        task.assignedTo = selectedMember;
        task.status = "in-progress"; // Uppdatera status när tilldelningen görs
        await updateTask(task.id, { assignedTo: selectedMember, status: "in-progress" });
        loadBoard();
      }
    });
  }

  return taskDiv;
}

// Flyttar en uppgift mellan statuskolumnerna
async function moveTask(task: Task, direction: "left" | "right") {
  const statusOrder: Task["status"][] = ["to-do", "in-progress", "done"];
  let currentIndex = statusOrder.indexOf(task.status);

  console.log(`Moving task ${task.title} from ${task.status} to ${direction}`);

  if (direction === "right" && task.status === "to-do" && (!task.assignedTo || task.assignedTo === "Ingen")) {
    alert("Tilldela en person innan du kan flytta uppgiften till 'in-progress'.");
    return;
  }

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
