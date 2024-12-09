"use strict";
// DOM-element som behövs för applikationen
const list = document.querySelector("#list");
const form = document.getElementById("new-task-form");
const input = document.querySelector("#new-task-title");
// Kontrollera att nödvändiga element finns
if (!form || !input) {
    throw new Error("Required DOM elements not found");
}
// Ladda sparade uppgifter från localStorage
const tasks = loadTasks();
tasks.forEach(addListItem);
// Generera unik ID för varje uppgift
function generateRandomId() {
    return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
// Hantera när användaren lägger till ny uppgift
form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Ta bort eventuella mellanslag i början och slutet av input
    const trimmedInput = input.value.trim();
    if (trimmedInput === "")
        return;
    // Kontrollera om uppgiften redan finns
    const isDuplicate = tasks.some((task) => task.title.toLowerCase() === trimmedInput.toLowerCase());
    // Om uppgiften redan finns, visa meddelande och avbryt
    if (isDuplicate) {
        input.value = "";
        input.placeholder = "This task already exist";
        // Funktion för att återställa placeholder
        const resetPlaceholder = () => {
            input.placeholder = "Write a new task";
        };
        input.addEventListener("focus", resetPlaceholder);
        input.addEventListener("click", resetPlaceholder);
        return;
    }
    // Skapa ett nytt task-objekt med unik ID och aktuell tidstämpel
    const newTask = {
        id: generateRandomId(),
        title: trimmedInput,
        completed: false,
        createdAt: new Date(),
    };
    // Lägg till uppgiften i tasks-arrayen och spara till localStorage
    tasks.push(newTask);
    saveTasks();
    // Skapa och lägg till DOM-element för den nya uppgiften
    addListItem(newTask);
    // Återställ input-fältet
    input.value = "";
});
// Skapa HTML-element för en uppgift och lägg till i listan
function addListItem(task) {
    // Skapa DOM-element för uppgiften
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const deleteBtn = document.createElement("button");
    // Hantera checkbox-ändringar
    checkbox.addEventListener("change", (e) => {
        e.preventDefault();
        task.completed = checkbox.checked;
        saveTasks();
    });
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    // Konfigurera radera-knappen med två-stegs borttagning
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
        if (deleteBtn.textContent === "Delete") {
            // Första klicket - visa varning
            deleteBtn.textContent = "Are you sure?";
        }
        else {
            // Andra klicket - ta bort uppgiften
            removeTask(task.id);
            item.remove();
        }
    });
    // Återställ knappens text när muspekaren lämnar knappen
    deleteBtn.addEventListener("mouseout", () => {
        deleteBtn.textContent = "Delete";
    });
    // Sätt ihop och lägg till elementen
    if (list) {
        label.append(checkbox, task.title);
        item.append(label, deleteBtn);
        list.append(item);
    }
}
// Spara uppgifter till localStorage
function saveTasks() {
    localStorage.setItem("TASKS", JSON.stringify(tasks));
}
// Hämta uppgifter från localStorage
function loadTasks() {
    const taskJSON = localStorage.getItem("TASKS");
    if (taskJSON == null)
        return [];
    const loadedTasks = JSON.parse(taskJSON);
    // Konvertera datum-strängar tillbaka till Date-objekt eftersom JSON.parse inte behåller Date-typen
    return loadedTasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
    }));
}
// Ta bort en uppgift från arrayen och localStorage
function removeTask(taskId) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex > -1) {
        tasks.splice(taskIndex, 1);
        saveTasks();
    }
}
// Hämta reset-knappen från DOM
const resetButton = document.getElementById("reset-button");
// Hjälpfunktion för att hantera knappar med bekräftelse
function createConfirmButton(button, defaultText, onConfirm) {
    button.textContent = defaultText;
    button.addEventListener("click", () => {
        if (button.textContent === defaultText) {
            // Första klicket - visa varning
            button.textContent = "Are you sure?";
        }
        else {
            // Andra klicket - utför åtgärden
            onConfirm();
            button.textContent = defaultText;
        }
    });
    // Återställ knappens text när muspekaren lämnar knappen
    button.addEventListener("mouseout", () => {
        button.textContent = defaultText;
    });
}
// Använd funktionen för reset-knappen
if (resetButton) {
    createConfirmButton(resetButton, "Remove all tasks", () => {
        localStorage.removeItem("TASKS");
        tasks.length = 0;
        if (list) {
            list.innerHTML = "";
        }
    });
}
// Hämta remove-completed-knappen från DOM
const removeCompletedButton = document.getElementById("remove-completed-button");
// Använd funktionen för remove-completed-knappen
if (removeCompletedButton) {
    createConfirmButton(removeCompletedButton, "Remove completed tasks", () => {
        const incompleteTasks = tasks.filter((task) => !task.completed);
        tasks.length = 0;
        tasks.push(...incompleteTasks);
        saveTasks();
        if (list) {
            list.innerHTML = "";
            tasks.forEach(addListItem);
        }
    });
}
