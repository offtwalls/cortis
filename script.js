// ===== 멤버 이름 =====
const members = ["마틴", "제임스", "주훈", "성현", "건호"];

// ===== 셀 내용 =====
const labels = [
    ["", "젯틴", "훈틴", "엄틴", "껀틴"],
    ["틴젯", "", "눟젯", "셩젯", "낭젯"],
    ["틴훈", "젯쮸", "", "셩쮼", "낭쮼"],
    ["틴셩", "젯셩", "쭈엄", "", "낭셩"],
    ["틴껀", "젬껀", "쮸건", "엄껀", ""]
];

const table = document.getElementById("rpsTable");
const picker = document.getElementById("picker");

let selectedCell = null;

// ===== 표 생성 =====
function createTable() {

    let html = "<tr><th></th>";

    members.forEach(name => {
        html += `<th>${name}</th>`;
    });

    html += "</tr>";

    members.forEach((rowName, row) => {

        html += `<tr><th>${rowName}</th>`;

        members.forEach((_, col) => {

            if (row === col) {

                html += `<td class="disabled"></td>`;

            } else {

                html += `
                <td
                    data-id="${row}-${col}"
                    class="cell">
                    ${labels[row][col]}
                </td>`;
            }

        });

        html += "</tr>";

    });

    table.innerHTML = html;

    loadColors();

    bindEvents();

}

// ===== 셀 클릭 =====
function bindEvents() {

    document.querySelectorAll(".cell").forEach(cell => {

        cell.addEventListener("click", e => {

            selectedCell = cell;

            picker.style.display = "flex";

            picker.style.left = `${e.pageX}px`;
            picker.style.top = `${e.pageY}px`;

        });

    });

}

// ===== 색 선택 =====
document.querySelectorAll(".pick").forEach(btn => {

    btn.addEventListener("click", () => {

        if (!selectedCell) return;

        // 기존 색 제거
        selectedCell.classList.remove(
            "otp",
            "good",
            "normal",
            "pass",
            "mine"
        );

        const color = btn.dataset.color;

        if (color !== "") {

            selectedCell.classList.add(color);

            localStorage.setItem(
                selectedCell.dataset.id,
                color
            );

        } else {

            localStorage.removeItem(
                selectedCell.dataset.id
            );

        }

        picker.style.display = "none";

    });

});

// ===== 저장 불러오기 =====
function loadColors() {

    document.querySelectorAll(".cell").forEach(cell => {

        const color = localStorage.getItem(
            cell.dataset.id
        );

        if (color) {

            cell.classList.add(color);

        }

    });

}

// ===== 바깥 클릭 시 닫기 =====
window.addEventListener("click", e => {

    if (
        !picker.contains(e.target) &&
        !e.target.classList.contains("cell")
    ) {

        picker.style.display = "none";

    }

});

// ===== ESC =====
window.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        picker.style.display = "none";

    }

});

createTable();
