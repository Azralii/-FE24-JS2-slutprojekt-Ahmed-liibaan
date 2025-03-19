import { createTeamMember,getTeamMembers } from "./modules/members";
import { createTask } from "./modules/tasks";
import { loadBoard } from "./modules/board";
import { TeamMember, Task } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  loadBoard();
  getMembersAndLoadOptions();
  const taskForm = document.getElementById("new-task-form") as HTMLFormElement | null;
  taskForm?.addEventListener("submit", handleAddNewTask);

  const memberForm = document.getElementById("new-member-form") as HTMLFormElement | null;
  memberForm?.addEventListener("submit", handleAddNewMember);
  setupEventListener("filter-assigned", loadBoard);
  setupEventListener("filter-category", loadBoard);
  setupEventListener("sort-by", loadBoard);
});

async function getMembersAndLoadOptions() {
  console.log("test");
  
    console.log(await getTeamMembers());
    var memberArray =   await getTeamMembers();
   await memberArray.forEach(m => {
    console.log(m.name);
    let optionDOM= document.createElement("option");
optionDOM.value=m.name;
optionDOM.innerText=m.name;
    document.getElementById("filter-assigned")?.appendChild( optionDOM)
    });
  


}


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

function getInputValue(id: string): string | null {
  return (document.getElementById(id) as HTMLInputElement | null)?.value || null;
}

function getTextAreaValue(id: string): string | null {
  return (document.getElementById(id) as HTMLTextAreaElement | null)?.value || null;
}

function getSelectValue(id: string): string | null {
  return (document.getElementById(id) as HTMLSelectElement | null)?.value || null;
}

// Hantera att lägga till en ny task
async function handleAddNewTask(event: Event) {
  event.preventDefault();

  const title = getInputValue("task-title");
  const description = getTextAreaValue("task-description");
  const category = getSelectValue("task-category");

  if (!title || !description || !category) {
    alert("Alla fält måste fyllas i!");
    return;
  }

  const newTask: Task = {
    id: "",
    title,
    description,
    date: new Date(),
    category: category as "UX" | "frontend" | "backend",
    status: "to-do",
    assignedTo: ""
  };

  await createTask(newTask);
  loadBoard();
  (document.getElementById("new-task-form") as HTMLFormElement)?.reset();
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
  const validRoles = ["ux", "frontend", "backend"];
  const invalidRoles = selectedRoles.filter(role => !validRoles.includes(role.toLowerCase()));

  if (invalidRoles.length > 0) {
    alert("Ogiltig roll vald: " + invalidRoles.join(", "));
    return;
  }

  if (selectedRoles.length < 1 || selectedRoles.length > 3) {
    alert("Välj minst 1 och max 3 roller.");
    return;
  }

  const newMember: TeamMember = {
    id: "",
    name,
    roles: selectedRoles.map(role => {
      const roleLower = role.toLowerCase();
      if (roleLower === "ux") return "UX";
      if (roleLower === "frontend") return "frontend";
      if (roleLower === "backend") return "backend";
      return role;
    }) as ("UX" | "frontend" | "backend")[]
  };

  await createTeamMember(newMember);
  alert("Team member added successfully!");
  (document.getElementById("new-member-form") as HTMLFormElement)?.reset();
}
