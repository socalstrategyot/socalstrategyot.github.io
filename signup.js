/* Email sign-up -> Google Sheet (via a Google Apps Script web app).
 *
 * SETUP: paste your Apps Script /exec URL below. Instructions in README.md.
 * Until it is set, the form falls back to a mailto: link so nothing is lost.
 */
var ENDPOINT = ""; // e.g. "https://script.google.com/macros/s/AKfy.../exec"
var FALLBACK_EMAIL = "jane.wu@anderson.ucla.edu";

(function () {
  var form = document.getElementById("signup-form");
  var msg = document.getElementById("form-msg");
  if (!form) return;

  function say(text, kind) {
    msg.textContent = text;
    msg.className = "form-msg" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.elements["name"].value.trim();
    var email = form.elements["email"].value.trim();
    var affiliation = form.elements["affiliation"].value.trim();

    if (form.elements["_honey"].value) return; // bot
    if (!name) return say("Please add your name.", "err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return say("Please check that email address.", "err");
    }

    if (!ENDPOINT) {
      var body =
        "Name: " + name + "\nEmail: " + email + "\nAffiliation: " + affiliation;
      window.location.href =
        "mailto:" + FALLBACK_EMAIL +
        "?subject=" + encodeURIComponent("SoCal Strategy & OT Workshop — keep me posted") +
        "&body=" + encodeURIComponent(body);
      return say("Opening your email client…");
    }

    var button = form.querySelector("button");
    button.disabled = true;
    say("Sending…");

    var data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("affiliation", affiliation);
    data.append("source", window.location.href);

    // no-cors: Apps Script accepts the POST but the response is opaque, so we
    // confirm optimistically. Check the sheet to verify a row landed.
    fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        form.reset();
        say("Thanks — we'll be in touch when registration opens.", "ok");
      })
      .catch(function () {
        say(
          "Something went wrong. Please email " + FALLBACK_EMAIL + " instead.",
          "err"
        );
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
