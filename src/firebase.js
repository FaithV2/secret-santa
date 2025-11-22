import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVyKqMkjq5naJkzqCFW-O0_UGeBtbc_LU",
  authDomain: "secret-santa-6820c.firebaseapp.com",
  projectId: "secret-santa-6820c",
  storageBucket: "secret-santa-6820c.firebasestorage.app",
  messagingSenderId: "850359312850",
  appId: "1:850359312850:web:9039a5fa1fccf9a3c4a80b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ---------------- Participants ----------------
export const addOrUpdateParticipant = async (name, amount, wishlist) => {
  const participantId = name.toLowerCase();
  return await setDoc(doc(db, "participants", participantId), { name, amount, wishlist });
};

export const getParticipants = async () => {
  const snapshot = await getDocs(collection(db, "participants"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const clearParticipants = async () => {
  const snapshot = await getDocs(collection(db, "participants"));
  await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, "participants", d.id))));
};

// ---------------- Assignments ----------------
export const saveAssignment = async (giverId, receiverId, amount, receiverWishlist, receiverName) => {
  return await setDoc(doc(db, "assignments", giverId), {
    giverId,
    receiverId,
    receiver: receiverName,
    receiverWishlist,
    amount
  });
};

export const getAssignments = async () => {
  const snapshot = await getDocs(collection(db, "assignments"));
  return snapshot.docs.map(doc => ({ giverId: doc.id, ...doc.data() }));
};
