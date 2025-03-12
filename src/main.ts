import { createTeamMember } from "./modules/members";
import { createTask } from "./modules/tasks";
import { loadBoard } from "./modules/board";
import { TeamMember, Task } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  // Ladda boarden och tasks
  loadBoard();

  // Hantera formulär för att skapa nya tasks
  const taskForm = document.getElementById("new-task-form") as HTMLFormElement | null;
  taskForm?.addEventListener("submit", handleAddNewTask);

  // Hantera formulär för att skapa nya team members
  const memberForm = document.getElementById("new-member-form") as HTMLFormElement | null;
  memberForm?.addEventListener("submit", handleAddNewMember);

  // Lyssna på filtrering & sortering
  setupEventListener("filter-status", loadBoard);
  setupEventListener("filter-assigned", loadBoard);
  setupEventListener("sort-by", loadBoard);
});

// Existerande hjälpfunktioner
function setupEventListener(elementId: string, callback: () => void) {
  const element = document.getElementById(elementId) as HTMLSelectElement | null;
  if (element) {
    element.addEventListener("change", callback);
  }
}

function getInputValue(id: string): string | null {
  return (document.getElementById(id) as HTMLInputElement | null)?.value || null;
}

function getTextAreaValue(id: string): string | null {
  return (document.getElementById(id) as HTMLTextAreaElement | null)?.value || null;
}

function getSelectValue(id: string): string | null {
  return (document.getElementById(id) as HTMLSelectElement | null)?.value || null;
}

// Funktion för att hantera att lägga till en ny team member
async function handleAddNewMember(event: Event) {
  event.preventDefault();

  const name = getInputValue("member-name");
  const rolesSelect = document.getElementById("member-roles") as HTMLSelectElement | null;

  if (!name || !rolesSelect) {
    console.error("Alla fält måste fyllas i!");
    alert("Alla fält måste fyllas i!");
    return;
  }

  // Hämta valda roller (multiple)
  const selectedRoles: string[] = Array.from(rolesSelect.selectedOptions).map(option => option.value);

  // Validate roles
  const validRoles = ["UX designer", "frontend developer", "backend developer"];
  const invalidRoles = selectedRoles.filter(role => !validRoles.includes(role));
  
  if (invalidRoles.length > 0) {
    alert("Ogiltig roll vald: " + invalidRoles.join(", "));
    return;
  }

  if (selectedRoles.length < 1 || selectedRoles.length > 3) {
    alert("Välj minst 1 och max 3 roller för teammedlemmen.");
    return;
  }

  const newMember: TeamMember = {
    id: "", // ID skapas av Firebase
    name,
    roles: selectedRoles as ("UX designer" | "frontend developer" | "backend developer")[]
  };

  await createTeamMember(newMember);
  alert("Team member added successfully!");

  (document.getElementById("new-member-form") as HTMLFormElement)?.reset();
}

// Funktion för att hantera att lägga till en ny task
async function handleAddNewTask(event: Event) {
  event.preventDefault();

  const title = getInputValue("task-title");
  const description = getTextAreaValue("task-description");
  const status = getSelectValue("task-status");
  const assignedTo = getInputValue("task-assigned");
  const category = getSelectValue("task-category");  // Get category from the form

  if (!title || !description || !status || !assignedTo || !category) {
    console.error("Alla fält måste fyllas i!");
    alert("Alla fält måste fyllas i!");
    return;
  }

  // Trimma och konvertera kategori till små bokstäver
  const categoryTrimmed = category?.trim().toLowerCase();

  // Definiera de giltiga kategorierna
  const validCategories: ("UX" | "frontend" | "backend")[] = ["UX", "frontend", "backend"];

  // Kontrollera om den valda kategorin är giltig
  if (!validCategories.includes(categoryTrimmed as "UX" | "frontend" | "backend")) {
    alert("Ogiltig kategori vald.");
    return;
  }

  const newTask: Task = {
    id: "", // ID skapas av Firebase när uppgiften skapas
    title,
    description,
    status: status as "to-do" | "in-progress" | "done",
    assignedTo,
    date: new Date(),
    category: category as "UX" | "frontend" | "backend" // Set the category field
  };

  await createTask(newTask);
  loadBoard();
  (document.getElementById("new-task-form") as HTMLFormElement)?.reset();
}
