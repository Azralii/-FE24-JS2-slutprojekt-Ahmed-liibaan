export interface Task {
  category: "UX" | "frontend" | "backend";  // Specify possible categories
  id: string;
  title: string;
  description: string;
  status: "to-do" | "in-progress" | "done";
  assignedTo: string;
  date: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  roles: ("UX designer" | "frontend developer" | "backend developer")[]; // Roles are defined as an array of specific strings
}