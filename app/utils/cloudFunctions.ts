import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase.config"; // ✅ Now works

const functions = getFunctions(app); // ✅ Initialize functions with the app instance

interface SaveSnapshotParams {
  uid: string;
  quizResultDocId: string;  // ✅ Changed: only need the document ID
  userConsent: boolean;
}

export const saveCrossProjectSnapshot = async (params: SaveSnapshotParams) => {
  try {
    const saveResults = httpsCallable(functions, 'saveQuizResults');
    
    const result = await saveResults({
      uid: params.uid,
      quizResultDocId: params.quizResultDocId,  // ✅ Updated
      userConsent: params.userConsent,
    });

    console.log('✅ Snapshot saved to main project:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error saving cross-project snapshot:', error);
    throw error;
  }
};