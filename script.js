// ==========================================
// 1. 기본 데이터 설정 (멤버 및 커플링 명칭)
// ==========================================
const members = ["마틴", "제임스", "주훈", "성현", "건호"];
const labels = [
    ["", "젯틴", "훈틴", "엄틴", "껀틴"],
    ["틴젯", "", "눟젯", "셩젯", "낭젯"],
    ["틴훈", "젯쮸", "", "셩쮼", "낭쮼"],
    ["틴셩", "젯셩", "쭈엄", "", "낭셩"],
    ["틴껀", "젬껀", "쮸건", "엄껀", ""]
];

// ==========================================
// 2. 범주(라벨 및 색상) 상태 관리
// ==========================================
const defaultCategories = [
    { id: "otp", name: "OTP", color: "#ffdee2" },
    { id: "good", name: "좋음", color: "#fcead2" },
    { id: "normal", name: "보통", color: "#fefcd0" },
    { id: "pass", name: "스루", color: "#e5fcdb" },
    { id: "mine", name: "지뢰", color: "#dbf4fc" }
];

let categories = JSON.parse(localStorage.getItem("cortis_categories")) || defaultCategories;

const table = document.getElementById("rpsTable");
const picker = document.getElementById("picker");
let configContainer = document.querySelector(".legend");

let selectedCell = null;

// ==========================================
// 3. 상단 설정 바 및 픽커 팝업 생성
// ==========================================
function initCategories() {
    if (!configContainer) {
        configContainer = document.createElement("div");
        configContainer.className = "legend";
        table.parentNode.insertBefore(configContainer, table);
    }
    
    configContainer.innerHTML = "";
    picker.innerHTML = ""; 

    categories.forEach((category) => {
        // [A] 상단 인풋 및 삭제 버튼 생성
        const item = document.createElement("div");
        item.className = "legend-item";
        item.style.cssText = "position: relative; display: flex; align-items: center; gap: 6px; padding-right: 12px;";

        item.innerHTML = `
            <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(0,0,0,.1); flex-shrink: 0;">
                <input type="color" value="${category.color}" data-id="${category.id}" class="category-color-input" 
                    style="position: absolute; top: -5px; left: -5px; width: 30px; height: 30px; border: none; padding: 0; cursor: pointer; background: transparent;">
            </div>
            <input type="text" value="${category.name}" data-id="${category.id}" class="category-name-input" 
                style="width: 50px; border: none; border-bottom: 1px solid #ccc; text-align: center; font-size: 15px; font-weight: 500; font-family: inherit; outline: none; background: transparent; color: #333;">
            <button class="category-delete-btn" data-id="${category.id}" 
                style="border: none; background: transparent; color: #aaa; cursor: pointer; font-size: 11px; padding: 0 2px; font-weight: bold; margin-left: -2px; transition: color 0.15s;">✕</button>
        `;
        configContainer.appendChild(item);

        // [B] 팝업창(picker) 내 픽 버튼 생성
        const pickBtn = document.createElement("button");
        pickBtn.className = `pick ${category.id}`;
        pickBtn.dataset.colorId = category.id;
        pickBtn.style.backgroundColor = category.color;
        picker.appendChild(pickBtn);
    });

    // [C] 지우기 버튼 생성
    const clearBtn = document.createElement("button");
    clearBtn.className = "pick clear";
    clearBtn.dataset.colorId = "";
    picker.appendChild(clearBtn);

    bindCategoryEvents();
    bindPickerEvents();
}

// ==========================================
// 4. 범례 설정 제어 및 실시간 동기화 이벤트
// ==========================================
function bindCategoryEvents() {
    // 색상 변경 시 실시간 반영
    document.querySelectorAll(".category-color-input").forEach(input => {
        input.addEventListener("input", (e) => {
            const id = e.target.dataset.id;
            const targetCat = categories.find(c => c.id === id);
            if (targetCat) {
                targetCat.color = e.target.value;
                saveCategories();
                updateUI();
            }
        });
    });

    // 라벨 텍스트 변경 시 실시간 반영
    document.querySelectorAll(".category-name-input").forEach(input => {
        input.addEventListener("input", (e) => {
            const id = e.target.dataset.id;
            const targetCat = categories.find(c => c.id === id);
            if (targetCat) {
                targetCat.name = e.target.value;
                saveCategories();
                updateUI();
            }
        });
    });

    // 범례 삭제 기능
    document.querySelectorAll(".category-delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            if (categories.length <= 1) {
                alert("최소 1개 이상의 범례는 유지되어야 합니다.");
                return;
            }

            categories = categories.filter(c => c.id !== id);
            saveCategories();

            // 지워진 색상이 칠해진 표의 셀 데이터 청소
            document.querySelectorAll(".cell").forEach(cell => {
                const savedId = localStorage.getItem(cell.dataset.id);
                if (savedId === id) {
                    cell.style.backgroundColor = "";
                    localStorage.removeItem(cell.dataset.id);
                }
            });

            initCategories();
            updateUI();
        });

        btn.addEventListener("mouseenter", () => btn.style.color = "#ff4d4d");
        btn.addEventListener("mouseleave", () => btn.style.color = "#aaa");
    });
}

function saveCategories() {
    localStorage.setItem("cortis_categories", JSON.stringify(categories));
}

function updateUI() {
    document.querySelectorAll("#picker .pick").forEach(btn => {
        const id = btn.dataset.colorId;
        if (!id) return;
        const cat = categories.find(c => c.id === id);
        if (cat) btn.style.backgroundColor = cat.color;
    });

    document.querySelectorAll(".cell").forEach(cell => {
        const colorId = localStorage.getItem(cell.dataset.id);
        if (colorId) {
            const cat = categories.find(c => c.id === colorId);
            cell.style.backgroundColor = cat ? cat.color : "";
        } else {
            cell.style.backgroundColor = "";
        }
    });
}

// ==========================================
// 5. 메인 표(Table) 생성 및 셀 선택
// ==========================================
function createTable() {
    let html = "<tr><th></th>";
    members.forEach(name => { html += `<th>${name}</th>`; });
    html += "</tr>";

    members.forEach((rowName, row) => {
        html += `<tr><th>${rowName}</th>`;
        members.forEach((_, col) => {
            if (row === col) {
                html += `<td class="disabled"></td>`;
            } else {
                html += `
                <td data-id="${row}-${col}" class="cell">
                    ${labels[row][col]}
                </td>`;
            }
        });
        html += "</tr>";
    });

    table.innerHTML = html;
    loadColors();     
    bindCellEvents(); 
}

function bindCellEvents() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("click", e => {
            selectedCell = cell;
            picker.style.display = "flex";
            picker.style.left = `${e.pageX}px`;
            picker.style.top = `${e.pageY}px`;
        });
    });
}

function bindPickerEvents() {
    document.querySelectorAll("#picker .pick").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!selectedCell) return;

            const colorId = btn.dataset.colorId;

            if (colorId !== "") {
                const cat = categories.find(c => c.id === colorId);
                selectedCell.style.backgroundColor = cat ? cat.color : "";
                localStorage.setItem(selectedCell.dataset.id, colorId);
            } else {
                selectedCell.style.backgroundColor = "";
                localStorage.removeItem(selectedCell.dataset.id);
            }

            picker.style.display = "none";
        });
    });
}

function loadColors() {
    document.querySelectorAll(".cell").forEach(cell => {
        const colorId = localStorage.getItem(cell.dataset.id);
        if (colorId) {
            const cat = categories.find(c => c.id === colorId);
            if (cat) cell.style.backgroundColor = cat.color;
        }
    });
}

window.addEventListener("click", e => {
    if (!picker.contains(e.target) && !e.target.classList.contains("cell") && !e.target.closest(".legend")) {
        picker.style.display = "none";
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "Escape") picker.style.display = "none";
});

createTable();
initCategories();
