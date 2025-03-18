export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: "UX" | "frontend" | "backend";
  status: "to-do" | "in-progress" | "done"; // Behövs för statusFilter
  assignedTo: string; // Behövs för assignedFilter
}

export type TeamMember = {
  id: string;
  name: string;
  roles: ("UX" | "frontend" | "backend")[]; // Minst 1, max 3
};
