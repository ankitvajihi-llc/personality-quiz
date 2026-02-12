import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.config";

export interface ArchetypeData {
  id: string;
  title: string;
  axes_target: {
    HP: number;
    WP: number;
    HF: number;
    CI: number;
  };
  description: string;
  imageUrl: string;
  order: number;
}

export const archetypes: ArchetypeData[] = [
  {
    id: "faithful",
    title: "Faithful",
    axes_target: {
      HP: 4,
      WP: 4,
      HF: 4,
      CI: 4,
    },
    description:
      "Practices are central, genuinely motivated, follows guidance closely, deeply embedded. Max on all axes.",
    imageUrl: "",
    order: 1,
  },
  {
    id: "harmonizer",
    title: "Harmonizer",
    axes_target: {
      HP: 3,
      WP: 3,
      HF: 2,
      CI: 3,
    },
    description:
      "Engaged and genuine but adapts rules to modern life. Well-connected but flexible on compliance.",
    imageUrl: "",
    order: 2,
  },
  {
    id: "questioner",
    title: "Questioner",
    axes_target: {
      HP: 2,
      WP: 3,
      HF: 1,
      CI: 2,
    },
    description:
      "Moderate practice, genuinely curious, questions and adapts guidance, selectively connected.",
    imageUrl: "",
    order: 3,
  },
  {
    id: "keeper",
    title: "Keeper",
    axes_target: {
      HP: 4,
      WP: 1,
      HF: 4,
      CI: 4,
    },
    description:
      "Practices central, follows rules strictly, deeply embedded — but motivation is duty/external, not genuine.",
    imageUrl: "",
    order: 4,
  },
  {
    id: "independent",
    title: "Independent",
    axes_target: {
      HP: 0,
      WP: 2,
      HF: 0,
      CI: 0,
    },
    description:
      "Practices peripheral, doesn't follow prescribed guidance, socially disconnected. Some self-directed motivation.",
    imageUrl: "",
    order: 5,
  },
];

// Function to upload archetypes to Firestore
export const uploadArchetypesToFirestore = async () => {
  try {
    const archetypesRef = collection(db, "personality_archetypes");

    for (const archetype of archetypes) {
      await setDoc(doc(archetypesRef, archetype.id), archetype);
      console.log(`✅ Uploaded archetype: ${archetype.title}`);
    }

    console.log("🎉 All archetypes uploaded successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error uploading archetypes:", error);
    return false;
  }
};
