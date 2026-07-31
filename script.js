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
const ratingArtTimers = new WeakMap();
const ratingArtworkSets = {
  star: [
    {
      blank: "figures/checkboxes/Star 1 blank.png",
      anime: "figures/checkboxes/Star 1 anime.png",
      filled: "figures/checkboxes/Star 1 all.png",
    },
    {
      blank: "figures/checkboxes/Star 2 blank.png",
      anime: "figures/checkboxes/Star 2 anime.png",
      filled: "figures/checkboxes/Star 2 all.png",
    },
    {
      blank: "figures/checkboxes/Star 3 blank.png",
      anime: "figures/checkboxes/Star 3 anime.png",
      filled: "figures/checkboxes/Star 3 all.png",
    },
    {
      blank: "figures/checkboxes/Star 4 blank.png",
      anime: "figures/checkboxes/Star 4 anime.png",
      filled: "figures/checkboxes/Star 4 filled.png",
    },
    {
      blank: "figures/checkboxes/Star 5 blank.png",
      anime: "figures/checkboxes/Star 5 anime.png",
      filled: "figures/checkboxes/Star 5 filled.png",
    },
  ],
  pig: [
    {
      blank: "figures/checkboxes/Pig nose blank.png",
      anime: "figures/checkboxes/Pig nose anime.png",
      filled: "figures/checkboxes/Pig nose filled.png",
    },
    {
      blank: "figures/checkboxes/Pig nose 2 blank.png",
      anime: "figures/checkboxes/Pig nose 2 anime.png",
      filled: "figures/checkboxes/Pig nose 2 filled.png",
    },
    {
      blank: "figures/checkboxes/Pig nose 3 blank.png",
      anime: "figures/checkboxes/Pig nose 3 anime.png",
      filled: "figures/checkboxes/Pig nose 3 filled.png",
    },
  ],
  flower: [
    {
      blank: "figures/checkboxes/Flower 1 blank.png",
      anime: "figures/checkboxes/Flower 1 anime.png",
      filled: "figures/checkboxes/Flower 1 filled.png",
    },
    {
      blank: "figures/checkboxes/flower 2 blank.png",
      anime: "figures/checkboxes/Flower 2 anime.png",
      filled: "figures/checkboxes/flower 2 filled.png",
    },
    {
      blank: "figures/checkboxes/Flower 3 blank.png",
      anime: "figures/checkboxes/Flower 3 anime.png",
      filled: "figures/checkboxes/Flower 3 filled.png",
    },
    {
      blank: "figures/checkboxes/flower 4 blank.png",
      anime: "figures/checkboxes/Flower 4 anime.png",
      filled: "figures/checkboxes/Flower 4 filled.png",
    },
    {
      blank: "figures/checkboxes/Flower 5 blank.png",
      anime: "figures/checkboxes/Flower 5 anime.png",
      filled: "figures/checkboxes/Flower 5 filled.png",
    },
  ],
};
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
  }, 200);

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

function shuffleArtwork(artwork) {
  const shuffled = [...artwork];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function getRatingArtwork(artStyle) {
  if (artStyle === "mixed") {
    const starCount = Math.random() < 0.5 ? 2 : 3;
    const pigCount = 5 - starCount;
    const mixedArtwork = [
      ...shuffleArtwork(ratingArtworkSets.star).slice(0, starCount),
      ...shuffleArtwork(ratingArtworkSets.pig).slice(0, pigCount),
    ];

    return shuffleArtwork(mixedArtwork);
  }

  const source = ratingArtworkSets[artStyle] ?? ratingArtworkSets.star;
  const artwork = [];

  while (artwork.length < 5) {
    artwork.push(...shuffleArtwork(source));
  }

  return artwork.slice(0, 5);
}

function setFoodRating(group, rating, animatedChoice = null) {
  const normalizedRating = Math.min(5, Math.max(0, Number(rating) || 0));
  group.dataset.rating = String(normalizedRating);

  group.querySelectorAll(".rating-choice").forEach((choice) => {
    const choiceValue = Number(choice.dataset.ratingValue);
    const image = choice.querySelector(".rating-art");
    const isFilled = choiceValue <= normalizedRating;
    const finalImage = isFilled
      ? choice.dataset.ratingFilled
      : choice.dataset.ratingBlank;
    const currentTimer = ratingArtTimers.get(choice);

    if (currentTimer) {
      window.clearTimeout(currentTimer);
      ratingArtTimers.delete(choice);
    }

    choice.classList.toggle("is-filled", isFilled);
    choice.classList.remove("is-animating");
    choice.setAttribute("aria-pressed", String(choiceValue === normalizedRating));

    if (!image) {
      return;
    }

    const shouldAnimate =
      choice === animatedChoice &&
      choice.dataset.ratingAnime &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!shouldAnimate) {
      image.src = finalImage;
      return;
    }

    image.src = choice.dataset.ratingAnime;
    void choice.offsetWidth;
    choice.classList.add("is-animating");

    const timer = window.setTimeout(() => {
      image.src = finalImage;
      choice.classList.remove("is-animating");
      ratingArtTimers.delete(choice);
    }, 200);

    ratingArtTimers.set(choice, timer);
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

    const artwork = getRatingArtwork(group.dataset.ratingArt);

    for (let value = 1; value <= 5; value += 1) {
      const choice = document.createElement("button");
      const art = artwork[value - 1];
      const image = document.createElement("img");

      choice.className = "rating-choice";
      choice.type = "button";
      choice.dataset.ratingValue = String(value);
      choice.dataset.ratingBlank = art.blank;
      choice.dataset.ratingAnime = art.anime;
      choice.dataset.ratingFilled = art.filled;
      choice.setAttribute("aria-label", `${value} 分`);
      choice.setAttribute("aria-pressed", "false");

      image.className = "rating-art";
      image.src = art.blank;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      choice.append(image);

      choice.addEventListener("click", () => {
        const currentRating = Number(group.dataset.rating) || 0;
        setFoodRating(
          group,
          currentRating === value ? 0 : value,
          choice,
        );
        saveFoodJournal();
      });
      group.append(choice);
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
