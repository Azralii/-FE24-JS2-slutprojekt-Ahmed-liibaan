import { db } from "../firebase";
import { ref, get, push, set } from "firebase/database";
import { TeamMember } from "../types";

// Hämta alla teammedlemmar
export async function getTeamMembers(): Promise<TeamMember[]> {
  const membersRef = ref(db, "members");
  const snapshot = await get(membersRef);

  if (!snapshot.exists()) {
    return [];
  }

  const membersData = snapshot.val();
  return Object.keys(membersData).map(id => ({
    id,
    ...membersData[id]
  })) as TeamMember[];
  return membersData;
}

// Skapa en ny teammedlem
export async function createTeamMember(member: TeamMember): Promise<void> {
  const membersRef = ref(db, "members");
  const newMemberRef = push(membersRef);
  await set(newMemberRef, member);
}



