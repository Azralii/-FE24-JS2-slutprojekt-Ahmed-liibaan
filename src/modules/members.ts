import { db } from "../firebase";
import { ref, get, push, set } from "firebase/database";
import { TeamMember } from "../types";

// Hämta alla teammedlemmar
export async function getTeamMembers(): Promise<TeamMember[]> {
  const membersRef = ref(db, "members");

  try {
    const snapshot = await get(membersRef);
    if (!snapshot.exists()) {
      return [];
    }

    const membersData = snapshot.val();
    return Object.keys(membersData).map(id => ({
      id,
      ...membersData[id]
    })) as TeamMember[];
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw new Error("Failed to load team members.");
  }
}

// Skapa en ny teammedlem
export async function createTeamMember(member: TeamMember): Promise<string> {
  const membersRef = ref(db, "members");
  const newMemberRef = push(membersRef);

  try {
    await set(newMemberRef, member);
    return newMemberRef.key as string; // Returnerar ID för den skapade medlemmen
  } catch (error) {
    console.error("Error creating team member:", error);
    throw new Error("Failed to create team member.");
  }
}
