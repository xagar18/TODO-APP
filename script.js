AWS.config.update({
  region: "us-east-1",
  accessKeyId: "AKIAYQNJS6EQW27AMS6F",
  secretAccessKey: "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",
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();
let username = ""; // Variable to store the username

// Predefined list of usernames
const predefinedUsernames = [
  "sagar9",
  "sagar8",
  "anou12",
  "renuka",
  "archi011",
  "temp1",
];

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const validateButton = document.getElementById("validate");
  const todoInp = document.getElementById("todoinput");
  const addtaskbtn = document.getElementById("addtask");
  const todoList = document.getElementById("todolist");
  const inputContainer = document.querySelector(".inputcontainer");
  const toggleCounterButton = document.getElementById("toggle-counter");
  const taskCounter = document.querySelector(".task-counter");

  validateButton.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username === "") {
      alert("Please enter your username.");
      return;
    }
    if (!predefinedUsernames.includes(username)) {
      alert(
        "Invalid username. Please contact admin at sagaryadav6352@gmail.com."
      );
      return;
    }
    loadTasks();
    inputContainer.classList.remove("hidden");
    usernameInput.style.display = "none";
    validateButton.style.display = "none"; // Show the input container
  });

  toggleCounterButton.addEventListener("click", () => {
    taskCounter.classList.toggle("hidden");
    toggleCounterButton.textContent = taskCounter.classList.contains("hidden")
      ? "Show Task Counts"
      : "Hide Task Counts";
  });

  addtaskbtn.addEventListener("click", () => {
    const taskText = todoInp.value.trim();
    if (taskText === "" || username === "") return;
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
    };
    saveTask(newTask);
    renderTask(newTask);
    updateTaskCounters(); // Update task counters
    todoInp.value = "";
  });

  function saveTask(task) {
    const params = {
      TableName: "ToDoListTasks",
      Item: {
        userId: username, // Use the captured username
        taskId: task.id,
        text: task.text,
        completed: task.completed,
      },
    };
    dynamoDB.put(params, (err) => {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        alert("Failed to save task. Please try again.");
      } else {
        console.log("Added item:", JSON.stringify(params, null, 2));
        alert("Task saved successfully!");
      }
    });
  }

  function loadTasks() {
    // Clear the existing tasks in the list
    todoList.innerHTML = "";

    const params = {
      TableName: "ToDoListTasks",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": username, // Use the captured username
      },
    };
    dynamoDB.query(params, (err, data) => {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        const tasks = data.Items.map((item) => ({
          id: item.taskId,
          text: item.text,
          completed: item.completed,
        }));
        tasks.forEach((task) => renderTask(task));
        updateTaskCounters(); // Update task counters
      }
    });
  }

  function renderTask(task) {
    const elem = document.createElement("li");

    // Create and configure checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      updateTask(task);
      elem.classList.toggle("completed", task.completed);
      updateTaskCounters(); // Update task counters
    });

    // Create task text element and add class for styling
    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.className = "task-text";

    // Create edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      editTask(task, taskText, editButton);
    });

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task);
      elem.remove();
      updateTaskCounters(); // Update task counters
    });

    // Append elements to list item
    elem.appendChild(checkbox);
    elem.appendChild(taskText);
    elem.appendChild(editButton);
    elem.appendChild(deleteButton);

    // Append list item to the list
    todoList.appendChild(elem);

    // Animation
    elem.style.opacity = 0;
    setTimeout(() => {
      elem.style.opacity = 1;
    }, 0);

    if (task.completed) elem.classList.add("completed");
  }

  function updateTask(task) {
    const params = {
      TableName: "ToDoListTasks",
      Key: {
        userId: username, // Use the captured username
        taskId: task.id,
      },
      UpdateExpression: "set #textAttr = :text, completed = :completed",
      ExpressionAttributeNames: {
        "#textAttr": "text", // Alias for the attribute name "text"
      },
      ExpressionAttributeValues: {
        ":text": task.text,
        ":completed": task.completed,
      },
    };
    dynamoDB.update(params, (err) => {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log("Updated item:", JSON.stringify(params, null, 2));
      }
    });
  }

  function deleteTask(task) {
    const params = {
      TableName: "ToDoListTasks",
      Key: {
        userId: username, // Use the captured username
        taskId: task.id,
      },
    };
    dynamoDB.delete(params, (err) => {
      if (err) {
        console.error(
          "Unable to delete item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log("Deleted item:", JSON.stringify(params, null, 2));
      }
    });
  }

  function updateTaskCounters() {
    const totalTasks = document.querySelectorAll("#todolist li").length;
    const completedTasks = document.querySelectorAll(
      "#todolist li.completed"
    ).length;
    const remainingTasks = totalTasks - completedTasks;

    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("completed-tasks").textContent = completedTasks;
    document.getElementById("remaining-tasks").textContent = remainingTasks;
  }

  function editTask(task, taskText, editButton) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.text;
    input.className = "edit-input";

    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.className = "ok-button";
    okButton.addEventListener("click", () => {
      const newText = input.value.trim();
      if (newText !== "" && newText !== task.text) {
        task.text = newText;
        updateTask(task); // Call updateTask to save the changes to the server only if there is a change
      }
      taskText.textContent = task.text;
      taskText.style.display = "";
      editButton.style.display = "";
      input.remove();
      okButton.remove();
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        okButton.click();
      }
    });

    taskText.style.display = "none";
    editButton.style.display = "none";
    taskText.parentNode.insertBefore(input, taskText);
    taskText.parentNode.insertBefore(okButton, editButton);
    input.focus();
  }

  // Add this to your existing script.js file
});
