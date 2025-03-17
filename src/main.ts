import { createTeamMember } from "./modules/members";
import { createTask } from "./modules/tasks";
import { loadBoard } from "./modules/board";
import { TeamMember, Task } from "./types";

// När dokumentet har laddats klart
document.addEventListener("DOMContentLoaded", () => {
  loadBoard();

  const taskForm = document.getElementById("new-task-form") as HTMLFormElement | null;
  taskForm?.addEventListener("submit", handleAddNewTask);

  const memberForm = document.getElementById("new-member-form") as HTMLFormElement | null;
  memberForm?.addEventListener("submit", handleAddNewMember);

  // Setup event listeners för filter
  setupEventListener("filter-status", loadBoard);
  setupEventListener("filter-assigned", loadBoard);
  setupEventListener("filter-category", loadBoard);
  setupEventListener("sort-by", loadBoard);

  // Uppdatera assignee dropdowns när sidan laddas
  updateAssigneeDropdowns();
});

// Funktion för att skapa event listeners på olika dropdowns
function setupEventListener(elementId: string, callback: () => void) {
  const element = document.getElementById(elementId) as HTMLSelectElement | null;
  if (element) {
    element.addEventListener("change", () => {
      console.log(`${elementId} ändrades!`);
      callback();
    });
  } else {
    console.warn(`⚠️ Element med ID "${elementId}" hittades inte!`);
  }
}

// Hämta värdet från inputfält
function getInputValue(id: string): string | null {
  return (document.getElementById(id) as HTMLInputElement | null)?.value || null;
}

// Hämta värdet från textarea
function getTextAreaValue(id: string): string | null {
  return (document.getElementById(id) as HTMLTextAreaElement | null)?.value || null;
}

// Hämta värdet från select
function getSelectValue(id: string): string | null {
  return (document.getElementById(id) as HTMLSelectElement | null)?.value || null;
}

// Hantera att lägga till en ny team member
async function handleAddNewMember(event: Event) {
  event.preventDefault();

  const name = getInputValue("member-name");
  const rolesSelect = document.getElementById("member-roles") as HTMLSelectElement | null;

  if (!name || !rolesSelect) {
    alert("Alla fält måste fyllas i!");
    return;
  }

  const selectedRoles: string[] = Array.from(rolesSelect.selectedOptions).map(option => option.value);

  // Definiera de giltiga rollerna
  const validRoles = ["UX", "frontend", "backend"];

  // Filtrera bort ogiltiga roller
  const invalidRoles = selectedRoles.filter(role => !validRoles.includes(role));

  if (invalidRoles.length > 0) {
    alert("Ogiltig roll vald: " + invalidRoles.join(", "));
    return;
  }

  if (selectedRoles.length < 1 || selectedRoles.length > 3) {
    alert("Välj minst 1 och max 3 roller.");
    return;
  }

  // Skapa och spara den nya medlemmen
  const newMember: TeamMember = {
    id: "",
    name,
    roles: selectedRoles as ("UX" | "frontend" | "backend")[],
  };

  await createTeamMember(newMember);
  alert("Team member added successfully!");

  // Uppdatera dropdowns efter att en ny medlem lagts till
  updateAssigneeDropdowns();

  // Rensa formuläret
  (document.getElementById("new-member-form") as HTMLFormElement)?.reset();
}

// Uppdatera dropdowns för assignee
function updateAssigneeDropdowns() {
  const assigneeFilter = document.getElementById("filter-assigned") as HTMLSelectElement | null;
  const taskAssigneeDropdown = document.getElementById("task-assigned") as HTMLSelectElement | null;

  if (!assigneeFilter || !taskAssigneeDropdown) {
    console.warn('Filter elements "filter-assigned" or "task-assigned" not found.');
    return;
  }

  // Rensa dropdown-listorna
  assigneeFilter.innerHTML = '<option value="all">All</option>';
  taskAssigneeDropdown.innerHTML = "";

  // Hämta teammedlemmar och uppdatera dropdowns
  getTeamMembers().then((teamMembers) => {
    teamMembers.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.name;
      option.textContent = member.name;

      // Lägg till i båda dropdowns
      assigneeFilter.appendChild(option.cloneNode(true));
      taskAssigneeDropdown.appendChild(option);
    });
  });
}

// Simulerad funktion för att hämta alla teammedlemmar
async function getTeamMembers(): Promise<TeamMember[]> {
  return [
    { id: "1", name: "Liibaan", roles: ["frontend", "UX"] },
    { id: "2", name: "Ali", roles: ["backend"] },
    { id: "3", name: "Ahmed", roles: ["UX", "frontend"] },
  ];
}

// Hantera att lägga till en ny task
async function handleAddNewTask(event: Event) {
  event.preventDefault();

  const title = getInputValue("task-title");
  const description = getTextAreaValue("task-description");
  const status = getSelectValue("task-status");
  const assignedTo = getInputValue("task-assigned");
  const category = getSelectValue("task-category");

  if (!title || !description || !status || !assignedTo || !category) {
    alert("Alla fält måste fyllas i!");
    return;
  }

  // Hämta teammedlemmen för att kontrollera om de har rätt roll
  const teamMembers = await getTeamMembers();
  const assignedMember = teamMembers.find(member => member.name === assignedTo);

  if (!assignedMember) {
    alert("Denna teammedlem finns inte.");
    return;
  }

  // Kontrollera om medlemmen har rätt roll för uppgiftens kategori
  if (category === "frontend" && !assignedMember.roles.includes("frontend")) {
    alert("Denna uppgift kan inte tilldelas till denna teammedlem eftersom den inte är en frontend-utvecklare.");
    return;
  }
  if (category === "backend" && !assignedMember.roles.includes("backend")) {
    alert("Denna uppgift kan inte tilldelas till denna teammedlem eftersom den inte är en backend-utvecklare.");
    return;
  }
  if (category === "UX" && !assignedMember.roles.includes("UX")) {
    alert("Denna uppgift kan inte tilldelas till denna teammedlem eftersom den inte är en UX-designer.");
    return;
  }

  const newTask: Task = {
    id: "",
    title,
    description,
    status: status as "to-do" | "in-progress" | "done",
    assignedTo,
    date: new Date(),
    category: category as "UX" | "frontend" | "backend"
  };

  await createTask(newTask);
  loadBoard();
  (document.getElementById("new-task-form") as HTMLFormElement)?.reset();
}
