import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { FormattingHistoryItem } from "@/src/types";

export const historyService = {
  async saveHistory(item: Omit<FormattingHistoryItem, "id" | "createdAt">) {
    return await addDoc(collection(db, "formatting_history"), {
      ...item,
      createdAt: serverTimestamp()
    });
  },

  async getHistory(userId: string) {
    const q = query(
      collection(db, "formatting_history"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FormattingHistoryItem[];
  },

  async deleteHistory(id: string) {
    await deleteDoc(doc(db, "formatting_history", id));
  }
};
