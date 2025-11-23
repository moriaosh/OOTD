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
// לוגיקה בסיסית לטפסים – צד לקוח בלבד
// כרגע זה רק מדמה שליחה לשרת / API
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


// מחכה שכל ה-HTML ייטען
document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------
    // טופס התחברות
    // ----------------------------------
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = loginForm.querySelector("#login-email").value.trim();
            const password = loginForm.querySelector("#login-password").value.trim();

            if (!email || !password) {
                showMessage(loginForm, "error", "נא למלא אימייל וסיסמה.");
                return;
            }

            console.log("LOGIN → אימייל:", email, "סיסמה:", password);

            showMessage(loginForm, "success", "מעולה! סימולציית התחברות הצליחה (כאן יחובר ה-API שלכם).");
        });
    }


    // ----------------------------------
    // טופס רישום
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

            console.log("REGISTER → שם:", name, "אימייל:", email);

            showMessage(registerForm, "success", "נרשמת בהצלחה (כרגע סימולציה, בהמשך יחובר לשרת ול-DB).");
        });
    }


    // ----------------------------------
    // טופס הוספת בגד
    // ----------------------------------
    const addItemForm = document.getElementById("add-item-form");

    if (addItemForm) {
        addItemForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const imageInput = addItemForm.querySelector("#item-image");
            const category = addItemForm.querySelector("#item-category").value;
            const color = addItemForm.querySelector("#item-color").value.trim();
            const name = addItemForm.querySelector("#item-name").value.trim();

            if (!imageInput.files || imageInput.files.length === 0) {
                showMessage(addItemForm, "error", "נא לבחור תמונה של הבגד.");
                return;
            }

            if (!category || !color || !name) {
                showMessage(addItemForm, "error", "נא למלא את כל שדות החובה.");
                return;
            }

            const file = imageInput.files[0];
            console.log(
                "ADD ITEM → שם:", name,
                "קטגוריה:", category,
                "צבע:", color,
                "קובץ:", file.name
            );

            showMessage(addItemForm, "success", "הבגד נוסף בהצלחה (כרגע סימולציה – בהמשך יחובר ל-Cloudinary ול-DB).");
        });
    }

});
