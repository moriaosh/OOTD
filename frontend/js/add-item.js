document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-item-form");
    const messageBox = document.querySelector(".message");
    const imageInput = document.getElementById("item-image");
    const preview = document.getElementById("image-preview");

    /* ================================
       ⭐ תצוגה מקדימה של תמונה
    ================================== */
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        } else {
            preview.src = "";
            preview.style.display = "none";
        }
    });

    /* ================================
       ⭐ שליחת הטופס לשרת
    ================================== */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        messageBox.textContent = "";
        messageBox.style.display = "none";

        const formData = new FormData();

        // קבלת הערכים
        const name = document.getElementById("item-name").value.trim();
        const category = document.getElementById("item-category").value;
        const color = document.getElementById("item-color").value.trim();
        const season = document.getElementById("item-season").value;
        const occasion = document.getElementById("item-occasion").value;
        const notes = document.getElementById("item-notes").value.trim();
        const image = imageInput.files[0];

        // בדיקת חובה
        if (!name || !category || !color || !season || !occasion || !image) {
            showMessage("⚠️ יש למלא את כל השדות החיוניים ולהעלות תמונה", "error");
            return;
        }

        // הוספת ל-FormData
        formData.append("Name", name);
        formData.append("Category", category);
        formData.append("Color", color);
        formData.append("Season", season);
        formData.append("Occasion", occasion);
        formData.append("Notes", notes);
        formData.append("Image", image); // VERY IMPORTANT!

        try {
            showMessage("⏳ מעלה את הבגד... רגע אחד ❤️", "loading");

            const response = await fetch("https://localhost:7087/api/Items", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error("Upload failed");
            }

            showMessage("✨ הבגד נוסף בהצלחה לארון! ✨", "success");

            // ניקוי הטופס + תצוגת תמונה
            form.reset();
            preview.src = "";
            preview.style.display = "none";

        } catch (error) {
            console.error(error);
            showMessage("❌ קרתה שגיאה בהעלאת הבגד. נסי שוב.", "error");
        }
    });

    /* ================================
       ⭐ פונקציית הודעות
    ================================== */
    function showMessage(text, type) {
        messageBox.style.display = "block";
        messageBox.textContent = text;

        messageBox.className = "message"; // reset styles

        if (type === "success") messageBox.style.color = "#3cb371";
        if (type === "error") messageBox.style.color = "#d9534f";
        if (type === "loading") messageBox.style.color = "#ff9800";
    }
});
