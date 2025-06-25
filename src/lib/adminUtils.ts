import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export async function createAdminUser(email: string, password: string) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the user document in Firestore with admin role
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, user };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    throw new Error(error.message || "Failed to create admin user");
  }
}

export async function isAdminUser(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    const role = userDoc.exists() ? userDoc.data().role : null;
    return role === "admin" || role === "superadmin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Function to create the first admin user
export async function createFirstAdminUser(email: string, password: string) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the user document in Firestore with admin role
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "admin",
      isFirstAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, user };
  } catch (error: any) {
    console.error("Error creating first admin user:", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please use a different email.");
    }
    throw new Error(error.message || "Failed to create first admin user");
  }
}

export async function updateAdminProfile(userId: string, profile: { firstName: string; lastName: string; phone: string }) {
  try {
    await updateDoc(doc(db, "users", userId), {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin profile:", error);
    throw new Error(error.message || "Failed to update admin profile");
  }
} 
