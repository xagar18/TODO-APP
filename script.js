AWS.config.update({
  region: "us-east-1",
  accessKeyId: "AKIAYQNJS6EQW27AMS6F",
  secretAccessKey: "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",
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();

document.addEventListener("DOMContentLoaded", () => {
  const todoInp = document.getElementById("todoinput");
  const addtaskbtn = document.getElementById("addtask");
  const todoList = document.getElementById("todolist");

  loadTasks();

  addtaskbtn.addEventListener("click", () => {
    const taskText = todoInp.value.trim();
    if (taskText === "") return;
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
    };
    saveTask(newTask);
    renderTask(newTask);
    todoInp.value = "";
  });

  function saveTask(task) {
    const params = {
      TableName: "ToDoListTasks",
      Item: {
        userId: "exampleUserId",
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
    const params = {
      TableName: "ToDoListTasks",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": "exampleUserId",
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
      }
    });
  }

  function renderTask(task) {
    const elem = document.createElement("li");
    elem.innerHTML = `${task.text} <button> Delete </button>`;
    todoList.appendChild(elem);

    // Animation
    elem.style.opacity = 0;
    setTimeout(() => {
      elem.style.opacity = 1;
    }, 0);

    if (task.completed) elem.classList.add("completed");

    elem.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      task.completed = !task.completed;
      updateTask(task);
      elem.classList.toggle("completed");
    });

    elem.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task);
      elem.remove();
    });
  }

  function updateTask(task) {
    const params = {
      TableName: "ToDoListTasks",
      Key: {
        userId: "exampleUserId",
        taskId: task.id,
      },
      UpdateExpression: "set completed = :completed",
      ExpressionAttributeValues: {
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
        userId: "exampleUserId",
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
});
