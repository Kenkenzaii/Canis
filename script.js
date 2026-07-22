/*
 * MEDIA CONFIGURATION
 * Fill the blank Main Results paths and Real/Partial GIF paths after selecting cases.
 * Paths are relative to this project_page directory.
 * Main Results example:
 * {
 *   title: "car",
 *   image2d: "assets/main-results/CASE_UID/image_anchors.png",
 *   registrationBefore: "assets/main-results/CASE_UID/registration_before.png",
 *   registrationAfter: "assets/main-results/CASE_UID/registration_after.png",
 *   glb: "assets/main-results/CASE_UID/canonical.glb",
 * }
 * Real/Partial example:
 * {
 *   name: "belt_021",
 *   input: "assets/gifs/real/input/belt_021__Scan__Scan__168340pts.gif",
 *   output: "assets/gifs/real/output/belt_021__Scan__Scan__168340pts.gif",
 * }
 */
const MEDIA = {
  mainResults: [
    { caseNumber: 7, uid: "74fa123561744c32bff6d5ef60b88ad7" },
    { caseNumber: 8, uid: "758eaa4f4cec4d31a41964a330bfaf46" },
    { caseNumber: 9, uid: "89545a657ce243148738302a4843f339" },
    { caseNumber: 10, uid: "911b309008d24829b65f72fd913b91b7" },
    { caseNumber: 1, uid: "2a7dbf5f9a1e45c299bc8dea451f9039" },
    { caseNumber: 11, uid: "912667d884234266805d11795590261f" },
    { caseNumber: 2, uid: "399463ec209b435b8c467dfe343d7628" },
    { caseNumber: 3, uid: "49d81cd52df6422a81132835c2555b2f" },
    { caseNumber: 4, uid: "56f95367a4854cd9b5332a411b481944" },
    { caseNumber: 5, uid: "5ba550465edf4a8fa2c5d6207a8494ac" },
    { caseNumber: 6, uid: "5fb48b7e431148dfa0793a0879d5974d" },
  ].map(({ caseNumber, uid }) => {
    const root = `assets/main-results/${uid}`;
    return {
      title: `Case ${String(caseNumber).padStart(2, "0")}`,
      image2d: `${root}/anchor_patches_only.png`,
      registrationBefore: `${root}/paper_center_aligned_uncanonicalized.png`,
      registrationAfter: `${root}/paper_registration_comparison.png`,
      glb: `${root}/canonicalized_front_view_anchors.glb`,
    };
  }),
  realSets: [
    {
      title: "Set 01",
      cases: [
        { name: "Book", input: "assets/gifs/real/input/book_021__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/book_021__Scan__Scan__168340pts.gif" },
        { name: "Box", input: "assets/gifs/real/input/boxed_beverage_010__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/boxed_beverage_010__Scan__Scan__168340pts.gif" },
        { name: "Box", input: "assets/gifs/real/input/boxed_beverage_007__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/boxed_beverage_007__Scan__Scan__168340pts.gif" },
        { name: "Chocolate", input: "assets/gifs/real/input/chocolate_014__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/chocolate_014__Scan__Scan__168340pts.gif" },
      ],
    },
    {
      title: "Set 02",
      cases: [
        { name: "Hammer", input: "assets/gifs/real/input/hammer_012__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/hammer_012__Scan__Scan__168340pts.gif" },
        { name: "Chicken Leg", input: "assets/gifs/real/input/chicken_leg_012__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/chicken_leg_012__Scan__Scan__168340pts.gif" },
        { name: "Carrot", input: "assets/gifs/real/input/carrot_005__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/carrot_005__Scan__Scan__168340pts.gif" },
        { name: "Handbag", input: "assets/gifs/real/input/handbag_053__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/handbag_053__Scan__Scan__168340pts.gif" },
      ],
    },
    {
      title: "Set 03",
      cases: [
        { name: "Toy Animals", input: "assets/gifs/real/input/toy_animals_016__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/toy_animals_016__Scan__Scan__168340pts.gif" },
        { name: "Teddy Bear", input: "assets/gifs/real/input/teddy_bear_009__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/teddy_bear_009__Scan__Scan__168340pts.gif" },
        { name: "Toy Animals", input: "assets/gifs/real/input/toy_animals_005__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/toy_animals_005__Scan__Scan__168340pts.gif" },
        { name: "Handbag", input: "assets/gifs/real/input/handbag_050__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/handbag_050__Scan__Scan__168340pts.gif" },
      ],
    },
    {
      title: "Set 04",
      cases: [
        { name: "Toy Motorcycle", input: "assets/gifs/real/input/toy_motorcycle_001__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/toy_motorcycle_001__Scan__Scan__168340pts.gif" },
        { name: "Toy Motorcycle", input: "assets/gifs/real/input/toy_motorcycle_005__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/toy_motorcycle_005__Scan__Scan__168340pts.gif" },
        { name: "Toy Motorcycle", input: "assets/gifs/real/input/toy_motorcycle_008__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/toy_motorcycle_008__Scan__Scan__168340pts.gif" },
        { name: "Tooth Paste", input: "assets/gifs/real/input/tooth_paste_035__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/tooth_paste_035__Scan__Scan__168340pts.gif" },
      ],
    },
    {
      title: "Set 05",
      cases: [
        { name: "Mouse", input: "assets/gifs/real/input/mouse_031__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/mouse_031__Scan__Scan__168340pts.gif" },
        { name: "Mouse", input: "assets/gifs/real/input/mouse_028__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/mouse_028__Scan__Scan__168340pts.gif" },
        { name: "Carrot", input: "assets/gifs/real/input/carrot_033__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/carrot_033__Scan__Scan__168340pts.gif" },
        { name: "Sausage", input: "assets/gifs/real/input/sausage_069__Scan__Scan__168340pts.gif", output: "assets/gifs/real/output/sausage_069__Scan__Scan__168340pts.gif" },
      ],
    },
  ],
  partialSets: [
    {
      title: "Set 01",
      cases: [
        { name: "", input: "assets/gifs/partial/input/3f32c7db8db74969ad6f3e78674a5933.gif", output: "assets/gifs/partial/output/3f32c7db8db74969ad6f3e78674a5933.gif" },
        { name: "", input: "assets/gifs/partial/input/7CoQuqqEaSGyzBuPPOA4QtYW3gQ.gif", output: "assets/gifs/partial/output/7CoQuqqEaSGyzBuPPOA4QtYW3gQ.gif" },
        { name: "", input: "assets/gifs/partial/input/6e53ddefba2e45dda8e4f1c73fb89f67.gif", output: "assets/gifs/partial/output/6e53ddefba2e45dda8e4f1c73fb89f67.gif" },
        { name: "", input: "assets/gifs/partial/input/6ee71b1571464747ac92b5a1d0c781c3.gif", output: "assets/gifs/partial/output/6ee71b1571464747ac92b5a1d0c781c3.gif" },
      ],
    },
    {
      title: "Set 02",
      cases: [
        { name: "", input: "assets/gifs/partial/input/29e8455df549435294dc241a35fba3b2.gif", output: "assets/gifs/partial/output/29e8455df549435294dc241a35fba3b2.gif" },
        { name: "", input: "assets/gifs/partial/input/048a7e91bec24ed182671874b7cb6a47.gif", output: "assets/gifs/partial/output/048a7e91bec24ed182671874b7cb6a47.gif" },
        { name: "", input: "assets/gifs/partial/input/2c2b2d988c7f43708de7eacf110f4a9d.gif", output: "assets/gifs/partial/output/2c2b2d988c7f43708de7eacf110f4a9d.gif" },
        { name: "", input: "assets/gifs/partial/input/49ef953306874e7b9ebecb64093f09b6.gif", output: "assets/gifs/partial/output/49ef953306874e7b9ebecb64093f09b6.gif" },
      ],
    },
    {
      title: "Set 03",
      cases: [
        { name: "", input: "assets/gifs/partial/input/05deebe7d64145f2a81da184ec294ed4.gif", output: "assets/gifs/partial/output/05deebe7d64145f2a81da184ec294ed4.gif" },
        { name: "", input: "assets/gifs/partial/input/5d2e691731b44df5bd8eba1c7a7695f1.gif", output: "assets/gifs/partial/output/5d2e691731b44df5bd8eba1c7a7695f1.gif" },
        { name: "", input: "assets/gifs/partial/input/3f5682a7d46d4aa99d145d26258dee73.gif", output: "assets/gifs/partial/output/3f5682a7d46d4aa99d145d26258dee73.gif" },
        { name: "", input: "assets/gifs/partial/input/5f56f80717c34647ace6fe7675227d7c.gif", output: "assets/gifs/partial/output/5f56f80717c34647ace6fe7675227d7c.gif" },
      ],
    },
    {
      title: "Set 04",
      cases: [
        { name: "", input: "assets/gifs/partial/input/8cf02cdc5fe544b6960d66d70193a86a.gif", output: "assets/gifs/partial/output/8cf02cdc5fe544b6960d66d70193a86a.gif" },
        { name: "", input: "assets/gifs/partial/input/18f3e9d66b2047b59af80d9ee90fd036.gif", output: "assets/gifs/partial/output/18f3e9d66b2047b59af80d9ee90fd036.gif" },
        { name: "", input: "assets/gifs/partial/input/0b0b32949c754e58988f1c26023e1077.gif", output: "assets/gifs/partial/output/0b0b32949c754e58988f1c26023e1077.gif" },
        { name: "", input: "assets/gifs/partial/input/19dcaf51372043718054db776c2e55e4.gif", output: "assets/gifs/partial/output/19dcaf51372043718054db776c2e55e4.gif" },
      ],
    },
  ],
};

/*
 * Each correspondence case contains a 2D anchor image and a GLB for every backbone.
 * Keep either path blank to show its reserved placeholder.
 */
function correspondenceCase(title, uid) {
  const root = `assets/correspondences/${uid}`;
  const image = `${root}/2d_anchors.png`;
  return {
    title,
    trellis: { image, glb: `${root}/trellis_marked_anchors.glb` },
    "trellis-oa": { image, glb: `${root}/trellis_oa_marked_anchors.glb` },
    triposr: { image, glb: `${root}/triposg_marked_anchors.glb` },
  };
}

const CORRESPONDENCE_CASES = [
  correspondenceCase("Fish", "03d4836e66e04a5b99c994fd0b6a5f44"),
  correspondenceCase("Sports car", "0ce1420f5d3045bfbbfc7e3683761e1e"),
  correspondenceCase("Dragon", "2fe1650ef89247a58fddeb07e47c43e9"),
  correspondenceCase("Sunflower", "3e38e8351c6e48e786cdd8bd181a09db"),
  correspondenceCase("Motorcycle", "3e6f9b9cbaec41dfa411696177759431"),
  correspondenceCase("Violin", "4ea1eb161ce34b3cad5b2aa50428d9f5"),
  correspondenceCase("Motorbike", "4fc3500e04b14e73b942d85bc948c5e9"),
  correspondenceCase("Airplane", "4ff9de0228b446758a2e8a9beb687acc"),
  correspondenceCase("Cartoon cat", "cartooncatsample"),
  correspondenceCase("Cartoon elephant", "cartoonelephantsample"),
  correspondenceCase("Cartoon sponge", "haimiansample"),
  correspondenceCase("Koala", "koalasample"),
  correspondenceCase("Rabbit", "rabbitsample"),
  correspondenceCase("Squirrel", "squirrelsample"),
  correspondenceCase("Tiger", "tigernewsample"),
];

const CORRESPONDENCE_MODELS = {
  "trellis-oa": {
    number: "01",
    kicker: "TRELLIS-OA backbone",
    title: "Image patch ↔ 3D anchor",
    description:
      "The OA variant exposes patch-to-cluster bindings used by CANIS to construct semantically anchored 3D registration constraints.",
  },
  trellis: {
    number: "02",
    kicker: "TRELLIS backbone",
    title: "Image patch ↔ 3D anchor",
    description:
      "Color-linked points reveal how selected image evidence activates semantically corresponding regions in the generated 3D representation.",
  },
  triposr: {
    number: "03",
    kicker: "TripoSR backbone",
    title: "Image patch ↔ 3D anchor",
    description:
      "This reserved panel will hold the TripoSR correspondence pair while preserving the same visual scale and comparison structure.",
  },
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add("visible"), delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const progressBar = document.querySelector(".progress span");
const headerLinks = [...document.querySelectorAll(".desktop-nav a")];
const observedSections = headerLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.width = `${Math.min(100, progress * 100)}%`;

  let active = observedSections[0];
  observedSections.forEach((section) => {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.45) active = section;
  });
  headerLinks.forEach((link) => {
    link.classList.toggle("active", active && link.getAttribute("href") === `#${active.id}`);
  });
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".desktop-nav");
menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
headerLinks.forEach((link) => link.addEventListener("click", () => {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

function initGallery(root, items) {
  const image2d = root.querySelector("[data-main-image2d]");
  const image2dEmpty = root.querySelector("[data-main-image2d-empty]");
  const image2dExpand = root.querySelector("[data-main-image-expand]");
  const registrationBefore = root.querySelector("[data-main-registration-before]");
  const registrationBeforeEmpty = root.querySelector("[data-main-registration-before-empty]");
  const registrationAfter = root.querySelector("[data-main-registration-after]");
  const registrationAfterEmpty = root.querySelector("[data-main-registration-after-empty]");
  const model = root.querySelector("[data-main-model]");
  const title = root.querySelector("[data-gallery-title]");
  const current = root.querySelector("[data-gallery-current]");
  const total = root.querySelector("[data-gallery-total]");
  const dots = root.querySelector(".gallery-dots");
  let index = 0;

  [
    [image2d, image2dEmpty],
    [registrationBefore, registrationBeforeEmpty],
    [registrationAfter, registrationAfterEmpty],
  ].forEach(([image, emptyState]) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      emptyState.hidden = false;
      if (image === image2d) image2dExpand.hidden = true;
    });
  });

  function renderImage(image, emptyState, path, alt) {
    const hasPath = typeof path === "string" && path.trim() !== "";
    image.hidden = !hasPath;
    emptyState.hidden = hasPath;
    if (hasPath) {
      image.alt = alt;
      image.src = path;
    } else {
      image.removeAttribute("src");
      image.alt = "";
    }
  }

  total.textContent = String(items.length).padStart(2, "0");
  items.forEach((item, dotIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show ${item.title}`);
    button.addEventListener("click", () => render(dotIndex));
    dots.append(button);
  });

  function render(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    const item = items[index];
    title.textContent = item.title;
    current.textContent = String(index + 1).padStart(2, "0");
    renderImage(image2d, image2dEmpty, item.image2d, `${item.title}: 2D observation with anchors`);
    image2dExpand.hidden = !item.image2d;
    renderImage(
      registrationBefore,
      registrationBeforeEmpty,
      item.registrationBefore,
      `${item.title}: point clouds before registration`,
    );
    renderImage(
      registrationAfter,
      registrationAfterEmpty,
      item.registrationAfter,
      `${item.title}: point clouds after registration`,
    );
    model.dataset.modelSrc = item.glb || "";
    model.classList.toggle("has-model", Boolean(item.glb));
    window.dispatchEvent(new CustomEvent("main-result-model-change", {
      detail: { src: item.glb || "", label: `${item.title} 3D source` },
    }));
    [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  }

  root.querySelector(".prev").addEventListener("click", () => render(index - 1));
  root.querySelector(".next").addEventListener("click", () => render(index + 1));
  image2dExpand.addEventListener("click", () => openLightbox(image2d.currentSrc || image2d.src));
  render(0);
}

document.querySelectorAll("[data-gallery='main']").forEach((gallery) => initGallery(gallery, MEDIA.mainResults));

function initDatasetViewer(root, items) {
  const pageSize = 4;
  const inputGroup = root.querySelector("[data-case-input]");
  const outputGroup = root.querySelector("[data-case-output]");
  const inputSlots = [...inputGroup.querySelectorAll(".media-slot")];
  const outputSlots = [...outputGroup.querySelectorAll(".media-slot")];
  const title = root.querySelector("[data-case-title]");
  const current = root.querySelector("[data-case-current]");
  const total = root.querySelector("[data-case-total]");
  const dots = root.querySelector(".gallery-dots");
  let index = 0;

  [...inputSlots, ...outputSlots].forEach((slot) => {
    const image = slot.querySelector("[data-slot-media]");
    image.addEventListener("load", () => slot.classList.add("has-media"));
    image.addEventListener("error", () => {
      image.hidden = true;
      slot.classList.remove("has-media");
      slot.classList.add("media-error");
    });
  });

  total.textContent = String(items.length * pageSize).padStart(2, "0");
  items.forEach((item, dotIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    const firstCase = dotIndex * pageSize + 1;
    button.setAttribute("aria-label", `Show cases ${firstCase} through ${firstCase + pageSize - 1}`);
    button.addEventListener("click", () => render(dotIndex));
    dots.append(button);
  });

  function render(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    const item = items[index];
    const cases = item.cases || [];
    const firstCase = index * pageSize + 1;
    const lastCase = firstCase + pageSize - 1;
    title.textContent = item.title;
    current.textContent = `${String(firstCase).padStart(2, "0")}–${String(lastCase).padStart(2, "0")}`;
    inputGroup.setAttribute("aria-label", `${item.title} input media placeholders`);
    outputGroup.setAttribute("aria-label", `${item.title} output media placeholders`);
    inputSlots.forEach((slot, slotIndex) => {
      renderDatasetSlot(slot, cases[slotIndex], "input", firstCase + slotIndex);
    });
    outputSlots.forEach((slot, slotIndex) => {
      renderDatasetSlot(slot, cases[slotIndex], "output", firstCase + slotIndex);
    });
    [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  }

  root.querySelector(".prev").addEventListener("click", () => render(index - 1));
  root.querySelector(".next").addEventListener("click", () => render(index + 1));
  render(0);
}

function renderDatasetSlot(slot, item = {}, mediaKey, caseNumber) {
  const image = slot.querySelector("[data-slot-media]");
  const label = slot.querySelector("[data-slot-index]");
  const name = item.name?.trim() || `Case ${String(caseNumber).padStart(2, "0")}`;
  const mediaPath = item[mediaKey]?.trim() || "";

  label.textContent = String(caseNumber).padStart(2, "0");
  slot.classList.remove("has-media", "media-error");
  slot.title = name;

  if (!mediaPath) {
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    return;
  }

  image.alt = `${name} ${mediaKey} rotation`;
  image.hidden = false;
  image.src = mediaPath;
}

document.querySelectorAll("[data-dataset-viewer='real']").forEach((viewer) => initDatasetViewer(viewer, MEDIA.realSets));
document.querySelectorAll("[data-dataset-viewer='partial']").forEach((viewer) => initDatasetViewer(viewer, MEDIA.partialSets));

const tabs = [...document.querySelectorAll(".model-tabs button")];
const corrImage = document.querySelector("[data-corr-image]");
const corrPlaceholder = document.querySelector(".placeholder-art");
const corrModel = document.querySelector("[data-corr-model]");
const corrNumber = document.querySelector(".model-number");
const corrKicker = document.querySelector("[data-corr-kicker]");
const corrTitle = document.querySelector("[data-corr-title]");
const corrDescription = document.querySelector("[data-corr-description]");
const corrExpand = document.querySelector(".corr-expand");
const corrCaseCurrent = document.querySelector("[data-corr-case-current]");
const corrCaseTotal = document.querySelector("[data-corr-case-total]");
const corrCaseTitle = document.querySelector("[data-corr-case-title]");
const corrEmptyLabel = document.querySelector("[data-corr-empty-label]");
const corrPrevious = document.querySelector(".correspondence-nav.prev");
const corrNext = document.querySelector(".correspondence-nav.next");
const corrContent = document.querySelector(".correspondence-content");
let currentCorrespondenceCase = 0;
let currentCorrespondenceModel = "trellis-oa";
let currentCorrespondenceImage = "";

function selectCorrespondence(key) {
  currentCorrespondenceModel = key;
  const item = CORRESPONDENCE_MODELS[key];
  const correspondenceCase = CORRESPONDENCE_CASES[currentCorrespondenceCase];
  const media = correspondenceCase[key] || { image: "", glb: "" };
  tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.model === key)));
  corrNumber.textContent = item.number;
  corrKicker.textContent = item.kicker;
  corrTitle.textContent = item.title;
  corrDescription.textContent = item.description;
  currentCorrespondenceImage = media.image || "";
  corrImage.hidden = !currentCorrespondenceImage;
  corrPlaceholder.hidden = Boolean(currentCorrespondenceImage);
  corrExpand.hidden = !currentCorrespondenceImage;
  corrEmptyLabel.textContent = `${correspondenceCase.title} · ${item.kicker.replace(" backbone", "")}`;
  if (currentCorrespondenceImage) {
    corrImage.src = currentCorrespondenceImage;
    corrImage.alt = `${item.kicker}: ${item.title}`;
  } else {
    corrImage.removeAttribute("src");
    corrImage.alt = "";
  }
  corrModel.dataset.modelSrc = media.glb || "";
  corrModel.dataset.modelKey = key;
  window.dispatchEvent(new CustomEvent("correspondence-model-change", {
    detail: {
      src: media.glb || "",
      model: key,
      label: `${correspondenceCase.title} ${item.kicker}`,
    },
  }));
}

function selectCorrespondenceCase(nextIndex, direction = "") {
  currentCorrespondenceCase = (
    nextIndex + CORRESPONDENCE_CASES.length
  ) % CORRESPONDENCE_CASES.length;
  const correspondenceCase = CORRESPONDENCE_CASES[currentCorrespondenceCase];
  corrCaseCurrent.textContent = String(currentCorrespondenceCase + 1).padStart(2, "0");
  corrCaseTitle.textContent = correspondenceCase.title;
  selectCorrespondence(currentCorrespondenceModel);
  if (direction && !reduceMotion) {
    corrContent.classList.remove("slide-from-left", "slide-from-right");
    void corrContent.offsetWidth;
    corrContent.classList.add(direction === "previous" ? "slide-from-left" : "slide-from-right");
  }
}

corrCaseTotal.textContent = String(CORRESPONDENCE_CASES.length).padStart(2, "0");
tabs.forEach((tab) => tab.addEventListener("click", () => selectCorrespondence(tab.dataset.model)));
corrPrevious.addEventListener("click", () => selectCorrespondenceCase(currentCorrespondenceCase - 1, "previous"));
corrNext.addEventListener("click", () => selectCorrespondenceCase(currentCorrespondenceCase + 1, "next"));
corrContent.addEventListener("animationend", () => {
  corrContent.classList.remove("slide-from-left", "slide-from-right");
});
corrImage.addEventListener("error", () => {
  corrImage.hidden = true;
  corrPlaceholder.hidden = false;
  corrExpand.hidden = true;
  currentCorrespondenceImage = "";
});
selectCorrespondenceCase(0);

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");

function openLightbox(src) {
  if (!src) return;
  lightboxImage.src = src;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button.dataset.lightbox));
});
corrExpand.addEventListener("click", () => openLightbox(currentCorrespondenceImage));
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});
