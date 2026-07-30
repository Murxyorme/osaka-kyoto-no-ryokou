const dayCards = document.querySelectorAll(".day-card");
const hotspots = document.querySelectorAll(".hotspot");
const dateChips = document.querySelectorAll(".date-chip");
const titleBanners = document.querySelectorAll("[data-title-banner]");
const openingScreen = document.querySelector("#opening-screen");
const openingButton = document.querySelector("#opening-button");
const tripContent = document.querySelector("#trip-content");
const packingCheckboxes = document.querySelectorAll(
  '.travel-checklist input[type="checkbox"]',
);
const foodJournalCheckboxes = document.querySelectorAll(
  '.food-journal input[type="checkbox"]',
);
const illustratedCheckboxes = document.querySelectorAll(
  ".illustrated-checkbox input[type='checkbox']",
);
const ratingGroups = document.querySelectorAll(".star-rating");
const root = document.documentElement;
const packingStorageKey = "osaka-kyoto-packing-checklist-v1";
const foodJournalStorageKey = "osaka-kyoto-food-journal-v1";
const checkboxArtTimers = new WeakMap();
const themeGlow = {
  "day-1": "rgba(191, 123, 71, 0.4)",
  "day-2": "rgba(142, 106, 168, 0.4)",
  "day-3": "rgba(190, 102, 74, 0.4)",
  "day-4": "rgba(106, 157, 93, 0.4)",
  "day-5": "rgba(216, 127, 58, 0.4)",
  "day-6": "rgba(205, 140, 123, 0.4)",
};

function getSavedPackingState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(packingStorageKey) ?? "{}");
    return savedState && typeof savedState === "object" ? savedState : {};
  } catch {
    return {};
  }
}

function updateCheckboxArt(checkbox, animate = false) {
  const label = checkbox.closest(".illustrated-checkbox");
  const image = label?.querySelector(".checkbox-art");

  if (!label || !image) {
    return;
  }

  const finalImage = checkbox.checked
    ? label.dataset.checkboxChecked
    : label.dataset.checkboxUnchecked;
  const currentTimer = checkboxArtTimers.get(checkbox);

  if (currentTimer) {
    window.clearTimeout(currentTimer);
  }

  label.classList.remove("is-animating");

  if (!animate || !label.dataset.checkboxAnime) {
    image.src = finalImage;
    return;
  }

  image.src = label.dataset.checkboxAnime;
  void label.offsetWidth;
  label.classList.add("is-animating");

  const timer = window.setTimeout(() => {
    image.src = finalImage;
    label.classList.remove("is-animating");
    checkboxArtTimers.delete(checkbox);
  }, 320);

  checkboxArtTimers.set(checkbox, timer);
}

function restoreCheckboxArt() {
  illustratedCheckboxes.forEach((checkbox) => {
    updateCheckboxArt(checkbox);
  });
}

function restorePackingChecklist() {
  const savedState = getSavedPackingState();

  packingCheckboxes.forEach((checkbox) => {
    checkbox.checked = savedState[checkbox.name] === true;
  });

  restoreCheckboxArt();
}

function savePackingChecklist() {
  const packingState = {};

  packingCheckboxes.forEach((checkbox) => {
    packingState[checkbox.name] = checkbox.checked;
  });

  try {
    localStorage.setItem(packingStorageKey, JSON.stringify(packingState));
  } catch {
    // The checklist still works when storage is unavailable.
  }
}

function getSavedFoodJournalState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(foodJournalStorageKey) ?? "{}");
    return savedState && typeof savedState === "object" ? savedState : {};
  } catch {
    return {};
  }
}

function setFoodRating(group, rating) {
  const normalizedRating = Math.min(5, Math.max(0, Number(rating) || 0));
  group.dataset.rating = String(normalizedRating);

  group.querySelectorAll(".rating-star").forEach((star) => {
    const starValue = Number(star.dataset.ratingValue);
    star.classList.toggle("is-filled", starValue <= normalizedRating);
    star.setAttribute("aria-pressed", String(starValue === normalizedRating));
  });
}

function saveFoodJournal() {
  const checkedItems = {};
  const ratings = {};

  foodJournalCheckboxes.forEach((checkbox) => {
    checkedItems[checkbox.name] = checkbox.checked;
  });

  ratingGroups.forEach((group) => {
    ratings[group.dataset.ratingKey] = Number(group.dataset.rating) || 0;
  });

  try {
    localStorage.setItem(
      foodJournalStorageKey,
      JSON.stringify({ checkedItems, ratings }),
    );
  } catch {
    // The journal still works when storage is unavailable.
  }
}

function initializeRatingGroups() {
  ratingGroups.forEach((group) => {
    if (group.children.length > 0) {
      return;
    }

    for (let value = 1; value <= 5; value += 1) {
      const star = document.createElement("button");
      star.className = "rating-star";
      star.type = "button";
      star.dataset.ratingValue = String(value);
      star.setAttribute("aria-label", `${value} 星`);
      star.setAttribute("aria-pressed", "false");
      star.textContent = "★";
      star.addEventListener("click", () => {
        const currentRating = Number(group.dataset.rating) || 0;
        setFoodRating(group, currentRating === value ? 0 : value);
        saveFoodJournal();
      });
      group.append(star);
    }
  });
}

function restoreFoodJournal() {
  const savedState = getSavedFoodJournalState();
  const checkedItems =
    savedState.checkedItems && typeof savedState.checkedItems === "object"
      ? savedState.checkedItems
      : {};
  const ratings =
    savedState.ratings && typeof savedState.ratings === "object"
      ? savedState.ratings
      : {};

  foodJournalCheckboxes.forEach((checkbox) => {
    checkbox.checked = checkedItems[checkbox.name] === true;
  });

  restoreCheckboxArt();

  ratingGroups.forEach((group) => {
    setFoodRating(group, ratings[group.dataset.ratingKey]);
  });
}

function setActiveDay(targetId) {
  dayCards.forEach((card) => {
    const isActive = card.id === targetId;
    card.classList.toggle("is-active", isActive);
    card.hidden = !isActive;

    if (isActive) {
      root.style.setProperty("--active", card.dataset.theme);
      root.style.setProperty("--active-soft", themeGlow[targetId]);
    }
  });

  titleBanners.forEach((node) => {
    const key = node.dataset.titleBanner;
    const isActive = key === targetId;
    node.hidden = !isActive;
  });

  hotspots.forEach((button) => {
    const isActive = button.dataset.day === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  dateChips.forEach((button) => {
    const isActive = button.dataset.day === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function bindSelectorButtons(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.day;
      setActiveDay(targetId);

      const shouldScrollToTop =
        targetId === "default" || window.matchMedia("(max-width: 980px)").matches;

      if (shouldScrollToTop) {
        window.requestAnimationFrame(() => {
          const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth";
          tripContent?.scrollIntoView({ behavior, block: "start" });
        });
      }
    });
  });
}

bindSelectorButtons(hotspots);
bindSelectorButtons(dateChips);
setActiveDay("default");
restorePackingChecklist();
initializeRatingGroups();
restoreFoodJournal();

packingCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    updateCheckboxArt(checkbox, true);
    savePackingChecklist();
  });
});

foodJournalCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    updateCheckboxArt(checkbox, true);
    saveFoodJournal();
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === packingStorageKey) {
    restorePackingChecklist();
  }

  if (event.key === foodJournalStorageKey) {
    restoreFoodJournal();
  }
});

function openTrip() {
  if (!openingScreen || !tripContent) {
    return;
  }

  document.body.classList.remove("is-opening");
  tripContent.hidden = false;
  openingScreen.classList.add("is-leaving");
  openingButton?.setAttribute("aria-expanded", "true");

  window.setTimeout(() => {
    openingScreen.hidden = true;
  }, 420);
}

document.body.classList.add("is-opening");
openingButton?.addEventListener("click", openTrip);
