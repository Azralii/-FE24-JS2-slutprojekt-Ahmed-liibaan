import { createTeamMember } from "./modules/members";
import { createTask } from "./modules/tasks";
import { loadBoard } from "./modules/board";
import { TeamMember, Task } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  loadBoard();

  const taskForm = document.getElementById("new-task-form") as HTMLFormElement | null;
  taskForm?.addEventListener("submit", handleAddNewTask);

  const memberForm = document.getElementById("new-member-form") as HTMLFormElement | null;
  memberForm?.addEventListener("submit", handleAddNewMember);

  setupEventListener("filter-status", loadBoard);
  setupEventListener("filter-assigned", loadBoard);
  setupEventListener("filter-category", loadBoard);
  setupEventListener("sort-by", loadBoard);
});

function setupEventListener(elementId: string, callback: () => void) {
  const element = document.getElementById(elementId) as HTMLSelectElement | null;
  if (element) {
    element.addEventListener("change", () => {
      console.log(`${elementId} ändrades!`); // ✅ Logga när dropdown ändras
      callback();
    });
  } else {
    console.warn(`⚠️ Element med ID "${elementId}" hittades inte!`);
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

  // Definiera de giltiga rollerna (alla små bokstäver)
  const validRoles = ["ux", "frontend", "backend"];

  // Filtrera bort ogiltiga roller, gör både de valda rollerna och de giltiga rollerna små bokstäver
  const invalidRoles = selectedRoles.filter(role => !validRoles.includes(role.toLowerCase()));

  if (invalidRoles.length > 0) {
    alert("Ogiltig roll vald: " + invalidRoles.join(", "));
    return;
  }

  if (selectedRoles.length < 1 || selectedRoles.length > 3) {
    alert("Välj minst 1 och max 3 roller.");
    return;
  }

  // Omvandla rollerna till korrekt typ ("UX", "frontend", "backend") innan vi skapar medlemmet
  const newMember: TeamMember = {
    id: "",
    name,
    roles: selectedRoles.map(role => {
      const roleLower = role.toLowerCase();
      if (roleLower === "ux") return "UX";  // Vi säkerställer att det är "UX" med stora bokstäver
      if (roleLower === "frontend") return "frontend";  // Vi håller det som "frontend"
      if (roleLower === "backend") return "backend";  // Vi håller det som "backend"
      return role; // Detta borde inte inträffa om validering sker korrekt
    }) as ("UX" | "frontend" | "backend")[]  // Tvinga om typen här
  };

  await createTeamMember(newMember);
  alert("Team member added successfully!");
  updateAssigneeFilter(); // Uppdatera assignee-filter efter att en ny medlem lagts till
  (document.getElementById("new-member-form") as HTMLFormElement)?.reset();
}

function updateAssigneeFilter() {
  const assigneeFilter = document.getElementById("filter-assigned") as HTMLSelectElement | null;

  // Check if assigneeFilter exists
  if (assigneeFilter) {
    getTeamMembers().then((teamMembers) => {
      // Clear the current options (ensure assigneeFilter exists first)
      assigneeFilter.innerHTML = '<option value="all">All</option>';

      // Add new options for each member (only add member's name, not roles)
      teamMembers.forEach((member) => {
        const option = document.createElement("option");
        option.value = member.name;
        option.textContent = member.name;
        assigneeFilter.appendChild(option);
      });
    });
  } else {
    console.warn('Filter element "filter-assigned" not found.');
  }
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

// Simulerad funktion för att hämta alla teammedlemmar 
async function getTeamMembers(): Promise<TeamMember[]> {
  return [
    { id: "1", name: "Liibaan", roles: ["frontend", "UX"] },
    { id: "2", name: "Ali", roles: ["backend"] },
    { id: "3", name: "Ahmed", roles: ["UX", "frontend"] },
  ];
}
