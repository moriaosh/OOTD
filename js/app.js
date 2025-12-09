// =====================================
// אפקט פתיחת ארון – מסך פתיחה לאתר
// =====================================
window.addEventListener("load", () => {
    const overlay = document.getElementById("wardrobe-overlay");
    if (!overlay) return;

    // פותח דלתות
    setTimeout(() => {
        overlay.classList.add("open");
    }, 300);

    // מעלים אחרי שהדלתות סיימו לזוז
    setTimeout(() => {
        overlay.classList.add("fade-out");
    }, 2300);
});

// =====================================
// סימולציית שרת באמצעות LocalStorage
// =====================================

// פונקציה כללית להצגת הודעה מתאימה לכל טופס
function showMessage(formElement, type, text) {
    const messageBox = formElement.querySelector(".message");
    if (!messageBox) return;

    messageBox.classList.remove("success", "error");
    messageBox.classList.add(type);
    messageBox.textContent = text;
    messageBox.style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------
    // 1. לוגיקה של הרשמה (REGISTER)
    // ----------------------------------
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = registerForm.querySelector("#register-name").value.trim();
            const email = registerForm.querySelector("#register-email").value.trim();
            const password = registerForm.querySelector("#register-password").value.trim();
            const confirmPassword = registerForm.querySelector("#register-confirm-password").value.trim();

            if (!name || !email || !password || !confirmPassword) {
                showMessage(registerForm, "error", "נא למלא את כל השדות.");
                return;
            }

            if (password !== confirmPassword) {
                showMessage(registerForm, "error", "הסיסמאות אינן תואמות.");
                return;
            }

            // שליפת משתמשים קיימים
            const users = JSON.parse(localStorage.getItem("ootd_users")) || [];

            // בדיקה אם האימייל כבר קיים
            const userExists = users.find(user => user.email === email);
            if (userExists) {
                showMessage(registerForm, "error", "האימייל הזה כבר קיים במערכת.");
                return;
            }

            // יצירת משתמש חדש ושמירה
            const newUser = { id: Date.now(), name, email, password };
            users.push(newUser);
            localStorage.setItem("ootd_users", JSON.stringify(users));

            showMessage(registerForm, "success", "נרשמת בהצלחה! מעביר להתחברות...");
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        });
    }


    // ----------------------------------
    // 2. לוגיקה של התחברות (LOGIN)
    // ----------------------------------
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = loginForm.querySelector("#login-email").value.trim();
            const password = loginForm.querySelector("#login-password").value.trim();

            const users = JSON.parse(localStorage.getItem("ootd_users")) || [];
            
            // חיפוש המשתמש
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // שמירת המשתמש המחובר כרגע
                localStorage.setItem("ootd_currentUser", JSON.stringify(user));
                
                showMessage(loginForm, "success", "התחברת בהצלחה!");
                setTimeout(() => { window.location.href = 'add-item.html'; }, 1500); // או לדף הבית
            } else {
                showMessage(loginForm, "error", "אימייל או סיסמה שגויים.");
            }
        });
    }


    // ----------------------------------
    // 3. טופס הוספת בגד (ADD ITEM)
    // ----------------------------------
    const addItemForm = document.getElementById("add-item-form");

    if (addItemForm) {
        // בדיקה שאכן יש משתמש מחובר
        const currentUser = JSON.parse(localStorage.getItem("ootd_currentUser"));
        if (!currentUser) {
            alert("עליך להתחבר כדי להוסיף בגדים!");
            window.location.href = "login.html";
            return;
        }

        addItemForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const imageInput = addItemForm.querySelector("#item-image");
            const category = addItemForm.querySelector("#item-category").value;
            const color = addItemForm.querySelector("#item-color").value.trim();
            const name = addItemForm.querySelector("#item-name").value.trim();

            if (!imageInput.files || imageInput.files.length === 0) {
                showMessage(addItemForm, "error", "נא לבחור תמונה.");
                return;
            }

            // המרה של התמונה ל-Base64 כדי שנוכל לשמור ב-LocalStorage
            const file = imageInput.files[0];
            const reader = new FileReader();

            reader.onload = function(event) {
                const imageBase64 = event.target.result; // התמונה כטקסט

                // שליפת פריטים קיימים
                const items = JSON.parse(localStorage.getItem("ootd_items")) || [];

                const newItem = {
                    id: Date.now(),
                    userId: currentUser.id, // משייך את הבגד למשתמש המחובר
                    name: name,
                    category: category,
                    color: color,
                    image: imageBase64 // שומרים את התמונה עצמה
                };

                items.push(newItem);
                localStorage.setItem("ootd_items", JSON.stringify(items));

                console.log("פריט נוסף:", newItem);
                showMessage(addItemForm, "success", "הבגד נוסף לארון שלך בהצלחה!");
                
                // איפוס הטופס
                addItemForm.reset();
            };

            // התחלת קריאת הקובץ
            reader.readAsDataURL(file);
        });
    }

});