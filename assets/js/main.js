(() => {
  function createModal() {
    const existing = document.getElementById("bookCallModal");
    if (existing) return existing;

    const modal = document.createElement("div");
    modal.id = "bookCallModal";
    modal.className = "book-call-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "bookCallModalTitle");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="book-call-dialog">
        <div class="book-call-header">
          <div class="book-call-header-text">
            <span class="book-call-kicker"><i class="bi bi-telephone-outbound-fill"></i> Free Consultation</span>
            <h2 id="bookCallModalTitle">Book A Strategy Call</h2>
            <p>Share your contact details—we'll reach out within 24 business hours.</p>
          </div>
          <button type="button" class="book-call-close" aria-label="Close booking popup">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="book-call-body">
          <form id="bookCallForm" class="book-call-form" novalidate>
            <div class="book-call-row-2">
              <div class="book-call-field">
                <i class="bi bi-person book-call-input-icon" aria-hidden="true"></i>
                <input type="text" id="bcName" name="name" placeholder="Name *" required autocomplete="name" aria-label="Name">
              </div>
              <div class="book-call-field">
                <i class="bi bi-telephone book-call-input-icon" aria-hidden="true"></i>
                <input type="tel" id="bcPhone" name="phone" placeholder="Phone No. *" required autocomplete="tel" aria-label="Phone Number">
              </div>
            </div>

            <div class="book-call-field">
              <i class="bi bi-envelope book-call-input-icon" aria-hidden="true"></i>
              <input type="email" id="bcEmail" name="email" placeholder="Email *" required autocomplete="email" aria-label="Email">
            </div>

            <div class="book-call-field book-call-textarea-wrap">
              <i class="bi bi-chat-dots book-call-input-icon" aria-hidden="true"></i>
              <textarea id="bcMessage" name="message" rows="2" placeholder="Message (optional — tell us briefly what you need)" aria-label="Message"></textarea>
            </div>

            <p class="book-call-error" id="bookCallError" role="alert" hidden></p>

            <button type="submit" class="book-call-submit">
              <span>Request Free Call</span>
              <i class="bi bi-arrow-up-right"></i>
            </button>

            <div class="book-call-trust">
              <span><i class="bi bi-shield-check"></i> No obligation</span>
              <span><i class="bi bi-clock"></i> Response in 24h</span>
              <span><i class="bi bi-geo-alt"></i> US &amp; Global Delivery</span>
            </div>
          </form>

          <div class="book-call-success" id="bookCallSuccess" hidden>
            <div class="book-call-success-badge">
              <i class="bi bi-check-lg"></i>
            </div>
            <h3>Call Request Confirmed!</h3>
            <p id="bookCallSuccessText">Thank you! Our team has received your consultation request and will reach out within one business day.</p>
            <button type="button" class="book-call-done-btn" id="bookCallDoneBtn">Done</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function initBookCallModal() {
    const modal = createModal();
    const form = modal.querySelector("#bookCallForm");
    const successBox = modal.querySelector("#bookCallSuccess");
    const successText = modal.querySelector("#bookCallSuccessText");
    const errorEl = modal.querySelector("#bookCallError");
    const closeBtn = modal.querySelector(".book-call-close");
    const doneBtn = modal.querySelector("#bookCallDoneBtn");
    const nameInput = modal.querySelector("#bcName");
    let lastTrigger = null;

    function openModal(trigger) {
      lastTrigger = trigger || document.activeElement;
      form.hidden = false;
      successBox.hidden = true;
      errorEl.hidden = true;

      const navCollapse = document.getElementById("mainNav");
      const navToggle = document.querySelector(".mobile-menu-toggle");
      if (navCollapse && navCollapse.classList.contains("is-open")) {
        navCollapse.classList.remove("is-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("book-call-lock");
      setTimeout(() => nameInput.focus(), 140);
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("book-call-lock");
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("nav.site-nav a.button-link, [data-open-book-call]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      openModal(btn);
    }, true);

    closeBtn.addEventListener("click", closeModal);
    doneBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();

      if (!name || !phone || !email) {
        errorEl.textContent = "Please enter your name, phone number, and email address.";
        errorEl.hidden = false;
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = "Please enter a valid email address.";
        errorEl.hidden = false;
        return;
      }

      errorEl.hidden = true;
      successText.textContent = `Thanks ${name}! Your call request has been received. We'll reach out within 24 business hours.`;
      form.hidden = true;
      successBox.hidden = false;
      form.reset();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBookCallModal);
  } else {
    initBookCallModal();
  }
})();
