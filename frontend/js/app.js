// =====================================
// קונפיגורציה בסיסית ו-Utilities
// =====================================
const API_BASE_URL = 'http://localhost:5000/api'; // ודאי שזהו פורט השרת הנכון שלך!

// פונקציה כללית להצגת הודעה מתאימה לכל טופס
function showMessage(formElement, type, text) {
    const messageBox = formElement.querySelector(".message");
    if (!messageBox) return;

    messageBox.classList.remove("success", "error");
    messageBox.classList.add(type);
    messageBox.textContent = text;
    messageBox.style.display = "block";
}

// פונקציה לשליפת הטוקן השמור
function getAuthToken() {
    return localStorage.getItem("ootd_authToken");
}


document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------
    // 1. לוגיקה של הרשמה (REGISTER) - הסבה ל-API
    // ----------------------------------
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // תיקון: קוראים את השדות הנכונים מה-HTML
            const firstName = registerForm.querySelector("#register-first-name").value.trim();
            const lastName = registerForm.querySelector("#register-last-name").value.trim();
            const email = registerForm.querySelector("#register-email").value.trim();
            const password = registerForm.querySelector("#register-password").value.trim();
            const confirmPassword = registerForm.querySelector("#register-confirm-password").value.trim();

            if (password !== confirmPassword) {
                showMessage(registerForm, "error", "הסיסמאות אינן תואמות.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: email, 
                        password: password,
                        firstName: firstName, // שם השדה ל-Backend
                        lastName: lastName 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(registerForm, "success", "נרשמת בהצלחה! מעביר להתחברות...");
                    localStorage.setItem("ootd_authToken", data.token);
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    showMessage(registerForm, "error", data.message || "שגיאה בהרשמה.");
                }

            } catch (error) {
                console.error("REGISTER ERROR:", error);
                showMessage(registerForm, "error", "שגיאה בחיבור לשרת.");
            }
        });
    }


    // ----------------------------------
    // 2. לוגיקה של התחברות (LOGIN) - הסבה ל-API
    // ----------------------------------
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = loginForm.querySelector("#login-email").value.trim();
            const password = loginForm.querySelector("#login-password").value.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // שמירת הטוקן
                    localStorage.setItem("ootd_authToken", data.token);
                    // שמירת פרטי משתמש (בלי סיסמה)
                    localStorage.setItem("ootd_currentUser", JSON.stringify(data.user)); 

                    showMessage(loginForm, "success", "התחברת בהצלחה!");
                    setTimeout(() => { window.location.href = 'add-item.html'; }, 1500);
                } else {
                    showMessage(loginForm, "error", data.message || "אימייל או סיסמה שגויים.");
                }

            } catch (error) {
                console.error("LOGIN ERROR:", error);
                showMessage(loginForm, "error", "שגיאה בחיבור לשרת.");
            }
        });
    }


    // ----------------------------------
    // 3. טופס הוספת בגד (ADD ITEM) - הסבה ל-FormData ול-API
    // הקוד המלא נמצא בקובץ add-item.js והוא ירוץ אוטומטית.
    // ----------------------------------
});