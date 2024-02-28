import { Sortable } from "@shopify/draggable";
import './style.css'

document.addEventListener("load", () => {
  const timerList = document.getElementById("timerList") as HTMLDivElement;
  const addTimerBtn = document.getElementById("addTimerBtn") as HTMLButtonElement;
  const defaultTimeInput = document.getElementById("defaultTime") as HTMLInputElement;
  const notifyCheckbox: HTMLInputElement = document.getElementById("notifyCheckbox") as HTMLInputElement;

  notifyCheckbox.addEventListener("change", function () {
    if (this.checked)  {
      requestNotificationPermission();
    }
  });

  addTimerBtn.addEventListener("click", addTimer);

  // Initialize Draggable for the timer list after timers are added
  const sortable = new Sortable(timerList, {
    draggable: ".timer", // assuming each timer is a direct child div of timerList
    handle: ".timer-handle",
  });

  function createTimerComponent(defaultTime: string) {
    const timerComponent = document.createElement("div");
    timerComponent.className = "timer";
    timerComponent.innerHTML = `
      <div class="timer-handle"></div>
      <input type="text" placeholder="Timer Title" class="timer-title"/>
      <input type="text" value="${defaultTime}" class="timer-value"/>
      <div class="btn-container flex-row">
        <button class="start-pause-btn">▶️</button>
        <button class="reset-initial-btn">⏏️</button>
        <button class="reset-default-btn">⤵️</button>
        <button class="remove-btn">❌</button>
      </div>

    `;
    timerList.appendChild(timerComponent);
    return timerComponent;
  }

  function addTimer() {
    const defaultTime = defaultTimeInput.value;
    const timerComponent = createTimerComponent(defaultTime);
    setupTimerControls(timerComponent, defaultTime);
  }

  function setupTimerControls(timerComponent: HTMLDivElement, initialTime: string) {
    const timerTitle = timerComponent.querySelector(".timer-title") as HTMLInputElement;
    const timerValue = timerComponent.querySelector(".timer-value") as HTMLInputElement;
    const startPauseBtn = timerComponent.querySelector(".start-pause-btn") as HTMLButtonElement;
    const resetInitialBtn = timerComponent.querySelector(".reset-initial-btn") as HTMLButtonElement;
    const resetDefaultBtn = timerComponent.querySelector(".reset-default-btn") as HTMLButtonElement;
    const removeBtn = timerComponent.querySelector(".remove-btn") as HTMLButtonElement;
    let intervalId: number | undefined;
    let wasRunning = false;

    function toggleTimer(shouldStart: boolean) {
      if (shouldStart) {
        startTimer();
      } else {
        clearInterval(intervalId);
        intervalId = undefined;
        startPauseBtn.textContent = "▶️";
        timerComponent.style.backgroundColor = ""; // Reset background color to default
      }
    }

    function startTimer() {
      // Clear background color when timer starts
      timerComponent.style.backgroundColor = "rgb(182, 243, 137)"; // Turn bg color to light green

      let [minutes, seconds] = timerValue.value.split(":").map((num: string) => parseInt(num, 10));
      let totalSeconds = minutes * 60 + seconds;

      intervalId = setInterval(() => {
        if (totalSeconds <= 0) {
          clearInterval(intervalId);
          intervalId = undefined;
          timerComponent.style.backgroundColor = "orange";
          onComplete();
          startPauseBtn.textContent = "▶️";
          return;
        }
        totalSeconds--;

        const mins = Math.floor(totalSeconds / 60).toString();
        const secs = (totalSeconds % 60).toString().padStart(2, "0");
        timerValue.value = `${mins}:${secs}`;
      }, 1000);

      startPauseBtn.textContent = "⏸️";
    }

    timerValue.addEventListener("focus", () => {
      if (intervalId !== undefined) {
        wasRunning = true;
        toggleTimer(false);
      }
    });

    timerValue.addEventListener("blur", () => {
      if (wasRunning) {
        toggleTimer(true);
        wasRunning = false; // Reset the flag
      }
    });

    startPauseBtn.addEventListener("click", () => {
      if (intervalId === undefined) {
        toggleTimer(true);
      } else {
        toggleTimer(false);
      }
    });

    resetDefaultBtn.addEventListener("click", () => {
      clearInterval(intervalId);
      intervalId = undefined;
      timerValue.value = defaultTimeInput.value; // Reset to the current default time
      timerComponent.style.backgroundColor = ""; // Remove background color
      startPauseBtn.textContent = "▶️";
    });

    resetInitialBtn.addEventListener("click", () => {
      clearInterval(intervalId);
      intervalId = undefined;
      timerValue.value = initialTime; // Reset to the initial time
      timerComponent.style.backgroundColor = ""; // Remove background color
      startPauseBtn.textContent = "▶️";
    });

    removeBtn.addEventListener("click", () => {
      clearInterval(intervalId);
      timerComponent.remove();
    });

    function playSound() {
      const audio = new Audio("complete.mp3"); // Correct path to the sound file
      audio.play();
    }

    function onComplete() {
      playSound();
      // Check if system notifications are enabled and send a notification
      if (notifyCheckbox.checked) {
        sendSystemNotification(`${timerTitle.value || "Timer"} Completed`, {
          body: `Your ${timerTitle.value ? timerTitle.value + " " : ""}timer has finished.`,
        });
      }
    }
  }

  function requestNotificationPermission() {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  }

  function sendSystemNotification(title: string, options: NotificationOptions) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission === "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  }
});
