document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("favoritesGrid");
    const emptyMessage = document.getElementById("emptyMessage");

    // הגנה – אם האלמנטים לא קיימים
    if (!grid || !emptyMessage) return;

    // קריאה בטוחה מהמקומי
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem("ootd_favorites")) || [];
    } catch (e) {
        console.error("Favorites parse error:", e);
        favorites = [];
    }

    // אם אין מועדפים
    if (favorites.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    // מניעת כפילויות
    favorites = [...new Set(favorites)];

    // מיפוי קטגוריות
    const categoryMap = {
        tops: {
            name: "חולצות / טופים",
            img: "images/categories/tops.png"
        },
        bottoms: {
            name: "מכנסיים / חצאיות",
            img: "images/categories/bottoms.png"
        },
        dresses: {
            name: "שמלות",
            img: "images/categories/dresses.png"
        },
        outerwear: {
            name: "ז'קטים / מעילים",
            img: "images/categories/outerwear.png"
        },
        shoes: {
            name: "נעליים",
            img: "images/categories/shoes.png"
        },
        accessories: {
            name: "אקססוריז",
            img: "images/categories/accessories.png"
        }
    };

    // יצירת הריבועים
    favorites.forEach(category => {

        if (!categoryMap[category]) return;

        const box = document.createElement("a");
        box.classList.add("category-box");
        box.href = `category-${category}.html`;

        box.innerHTML = `
            <img src="${categoryMap[category].img}" alt="${categoryMap[category].name}">
            <p>${categoryMap[category].name}</p>
        `;

        grid.appendChild(box);
    });
});
