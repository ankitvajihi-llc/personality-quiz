import { db } from '../firebase.config';
import { collection, doc, setDoc } from 'firebase/firestore';

export interface ArchetypeData {
  id: string;
  title: string;
  axes_target: {
    CC: number;
    MP: number;
    PS: number;
    M: number;
  };
  description: string;
  imageUrl: string;
  order: number;
}

export const archetypes: ArchetypeData[] = [
  {
    id: 'faithful',
    title: 'Faithful',
    axes_target: {
      CC: 5,
      MP: 5,
      PS: 5,
      M: 1
    },
    description: "The Faithful lives their Dawoodi Bohra identity fully, letting it shape daily life, routines, and decisions. They attend vaaz, perform khidmat, pray consistently, and take part in Moharram with deep emotional devotion. Modern life is approached in a way that supports their faith—they organize work, travel, and social commitments around religious obligations. For them, tradition is the framework, and modernity is adapted to ensure faith and community engagement remain central.",
    imageUrl: '',
    order: 1
  },
  {
    id: 'harmonizer',
    title: 'Harmonizer',
    axes_target: {
      CC: 4,
      MP: 4,
      PS: 3,
      M: 3
    },
    description: "The Harmonizer honors Dawoodi Bohra traditions while actively integrating modern life. They attend vaaz and maatham with sincerity, but may occasionally skip days of Moharram due to work or family obligations. Modern responsibilities, social life, and personal goals coexist with faith practices. They are proud of their identity and choose practices that maintain spiritual connection while allowing flexibility for contemporary life.",
    imageUrl: '',
    order: 2
  },
  {
    id: 'questioner',
    title: 'The Questioner',
    axes_target: {
      CC: 2,
      MP: 3,
      PS: 4,
      M: 4
    },
    description: "The Questioner engages deeply with both faith and understanding, reflecting critically on traditions. They attend vaaz, maatham, and Moharram, but with intellectual curiosity, sometimes researching or questioning practices. Modern life provides context and perspective—they may adopt technology, read broadly, or connect with diverse communities to enhance understanding. They blend tradition with thoughtfulness, crafting a personal faith that is meaningful, not mechanical.",
    imageUrl: '',
    order: 3
  },
  {
    id: 'keeper',
    title: 'Keeper',
    axes_target: {
      CC: 5,
      MP: 5,
      PS: 3,
      M: 1
    },
    description: "The Keeper follows Dawoodi Bohra rituals mainly because the people around them expect it. They attend vaaz, perform maatham, and take part in Moharram to keep family and community happy. Their faith expression is more about showing up and being present than personal intensity or deep spiritual experience. Modern life—work, school, or social plans—is balanced around these obligations, ensuring harmony with family and community priorities. The Keeper demonstrates care and respect through participation, even if it's more about social commitment than inner devotion.",
    imageUrl: '',
    order: 4
  },
  {
    id: 'independent',
    title: 'The Independent',
    axes_target: {
      CC: 1,
      MP: 2,
      PS: 2,
      M: 5
    },
    description: "The Independent is Dawoodi Bohra by lineage, but their life and identity are shaped largely outside the community. Their connection to Bohra traditions is minimal and personal, rather than social or familial. Participation in vaaz, maatham, or Moharram is rare and selective, and not central to how they define themselves. Meaning, values, and belonging are found through modern life, personal relationships, work, and wider cultural or spiritual influences. The Bohra identity exists as background heritage, not a guiding framework.",
    imageUrl: '',
    order: 5
  }
];

// Function to upload archetypes to Firestore
export const uploadArchetypesToFirestore = async () => {
  try {
    const archetypesRef = collection(db, 'personality_archetypes');
    
    for (const archetype of archetypes) {
      await setDoc(doc(archetypesRef, archetype.id), archetype);
      console.log(`✅ Uploaded archetype: ${archetype.title}`);
    }
    
    console.log('🎉 All archetypes uploaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error uploading archetypes:', error);
    return false;
  }
};