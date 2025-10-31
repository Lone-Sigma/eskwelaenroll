// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBhkOB7czk7j2qqDiOpWGnlS0ICedOtOtk",
  authDomain: "eskwelaenroll.firebaseapp.com",
  databaseURL: "https://eskwelaenroll-default-rtdb.firebaseio.com/",
  projectId: "eskwelaenroll",
  storageBucket: "eskwelaenroll.appspot.com",
  messagingSenderId: "20006672415",
  appId: "1:20006672415:web:667c119d184e7150429d2a",
  measurementId: "G-DNKL014SDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Table & Stat Elements
const tableBody = document.querySelector("#recent-applications tbody");
const totalStudentsEl = document.getElementById("total-students");
const enrolledStudentsEl = document.getElementById("enrolled-students");
const pendingStudentsEl = document.getElementById("pending-students");

// ✅ Simple Popup
function showPopup(message, isError = false) {
  const popup = document.createElement("div");
  popup.textContent = message;
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "10px 20px";
  popup.style.backgroundColor = isError ? "#e74c3c" : "#2ecc71";
  popup.style.color = "white";
  popup.style.borderRadius = "6px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  popup.style.zIndex = "9999";
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

// ✅ Load Enrollment Data
async function loadRecentApplications() {
  try {
    const snapshot = await get(child(ref(db), "enrollments"));

    if (!snapshot.exists()) {
      showPopup("⚠️ No enrollment data found.", true);
      return;
    }

    tableBody.innerHTML = "";

    let totalCount = 0;
    let enrolledCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let count = 1;

    // Loop through all enrollment records
    snapshot.forEach((childSnap) => {
      const data = childSnap.val();
      totalCount++;

      const student = data.student || {};
      const guardian = data.guardian || {};

      // ✅ Read status safely
      const status =
        (data.status || student.status || "Pending").toLowerCase();

      // ✅ Student Name
      const studentName = [
        student.firstName || "",
        student.middleName || "",
        student.lastName || ""
      ]
        .filter((n) => n.trim() !== "")
        .join(" ") || "N/A";

      const intendedGrade = student.intendedGrade || "N/A";
      const guardianContact = guardian.contactNumber || "N/A";

      // ✅ Determine status color/icon
      let statusClass = "status pending";
      let statusIcon = '<i class="fas fa-clock"></i>';
      let statusText = "Pending";

      if (status === "enrolled") {
        statusClass = "status active";
        statusIcon = '<i class="fas fa-check-circle"></i>';
        statusText = "Enrolled";
        enrolledCount++;
      } else if (status === "rejected") {
        statusClass = "status rejected";
        statusIcon = '<i class="fas fa-times-circle"></i>';
        statusText = "Rejected";
        rejectedCount++;
      } else {
        pendingCount++;
      }

      // ✅ Build row (limit to 5 latest)
      if (count <= 5) {
        const row = `
          <tr>
            <td>${count}</td>
            <td>${studentName}</td>
            <td>${intendedGrade}</td>
            <td>${guardianContact}</td>
            <td><span class="${statusClass}">${statusIcon} ${statusText}</span></td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
      }

      count++;
    });

    // ✅ Update Stat Cards
    if (totalStudentsEl) totalStudentsEl.textContent = totalCount;
    if (enrolledStudentsEl) enrolledStudentsEl.textContent = enrolledCount;
    if (pendingStudentsEl) pendingStudentsEl.textContent = pendingCount;

    showPopup("✅ Successfully retrieved enrollment data!");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    showPopup("❌ Error retrieving data. Check console.", true);
  }
}

// Run on load
window.addEventListener("DOMContentLoaded", loadRecentApplications);
