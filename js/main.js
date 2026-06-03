/* ===================================================================
   Selen & Anıl — Wedding Invitation
   Countdown · Add-to-Calendar (iOS/Android/Outlook) · Animations
   =================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------
     Event definition (single source of truth)
     ---------------------------------------------------------------- */
  var EVENT = {
    title: "Selen & Anıl Düğünü",
    description:
      "Selen & Anıl evleniyor! En mutlu günümüzde sizleri de aramızda görmekten mutluluk duyarız.",
    location: "Başoğlu Elit Kır Bahçesi, Çerkez Taş Köprü Köyü, Merkez / Düzce",
    mapUrl: "https://share.google/QC530GW3RZ2aOKU3E",
    // Local Turkey time (UTC+3). Start 19:00, end ~23:30.
    start: { y: 2026, mo: 9, d: 20, h: 19, mi: 0 },
    end: { y: 2026, mo: 9, d: 20, h: 23, mi: 30 },
    tz: "Europe/Istanbul",
    tzOffset: "+03:00"
  };

  /* ----------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // "YYYYMMDDTHHMMSS" local floating time (used with TZID)
  function localStamp(t) {
    return (
      t.y + pad(t.mo) + pad(t.d) + "T" + pad(t.h) + pad(t.mi) + "00"
    );
  }

  // UTC stamp "YYYYMMDDTHHMMSSZ" derived from local + offset
  function utcStamp(t) {
    var iso =
      t.y + "-" + pad(t.mo) + "-" + pad(t.d) + "T" +
      pad(t.h) + ":" + pad(t.mi) + ":00" + EVENT.tzOffset;
    var date = new Date(iso);
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) + "Z"
    );
  }

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    var platform = navigator.platform || "";
    var isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS
    var isMac = /Macintosh/.test(ua) && !isIOS;
    var isAndroid = /Android/.test(ua);
    return {
      ios: isIOS,
      mac: isMac,
      android: isAndroid,
      apple: isIOS || isMac
    };
  }

  /* ----------------------------------------------------------------
     Calendar link / file builders
     ---------------------------------------------------------------- */
  function buildICS() {
    var uid =
      "selen-anil-" + EVENT.start.y + EVENT.start.mo + EVENT.start.d +
      "@selenanilwedding.xyz";
    var dtstamp = utcStamp(EVENT.start);

    // \n joined then CRLF per RFC 5545
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//selenanilwedding.xyz//Wedding//TR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE",
      "TZID:" + EVENT.tz,
      "BEGIN:STANDARD",
      "DTSTART:19701025T040000",
      "TZOFFSETFROM:+0300",
      "TZOFFSETTO:+0300",
      "TZNAME:+03",
      "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + dtstamp,
      "DTSTART;TZID=" + EVENT.tz + ":" + localStamp(EVENT.start),
      "DTEND;TZID=" + EVENT.tz + ":" + localStamp(EVENT.end),
      "SUMMARY:" + escapeICS(EVENT.title),
      "DESCRIPTION:" + escapeICS(EVENT.description + "\\nKonum: " + EVENT.mapUrl),
      "LOCATION:" + escapeICS(EVENT.location),
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + escapeICS(EVENT.title),
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    return lines.join("\r\n");
  }

  function escapeICS(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function icsDataUri() {
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(buildICS());
  }

  function downloadICS() {
    var ics = buildICS();
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var filename = "selen-anil-dugun.ics";

    // iOS Safari can't trigger Blob downloads reliably -> use data URI navigation
    var plat = detectPlatform();
    if (plat.ios) {
      window.location.href = icsDataUri();
      return;
    }

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
      return;
    }

    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function googleCalUrl() {
    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: EVENT.title,
      dates: localStamp(EVENT.start) + "/" + localStamp(EVENT.end),
      ctz: EVENT.tz,
      details: EVENT.description + "\nKonum: " + EVENT.mapUrl,
      location: EVENT.location
    });
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  function outlookUrl() {
    function isoOffset(t) {
      return (
        t.y + "-" + pad(t.mo) + "-" + pad(t.d) + "T" +
        pad(t.h) + ":" + pad(t.mi) + ":00" + EVENT.tzOffset
      );
    }
    var params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: EVENT.title,
      startdt: isoOffset(EVENT.start),
      enddt: isoOffset(EVENT.end),
      body: EVENT.description + "\nKonum: " + EVENT.mapUrl,
      location: EVENT.location
    });
    return "https://outlook.live.com/calendar/0/deeplink/compose?" + params.toString();
  }

  /* ----------------------------------------------------------------
     Modal: build option list (platform-aware ordering + badge)
     ---------------------------------------------------------------- */
  var ICONS = {
    apple:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.7 12.6c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.4 2.1 2.5 2 1-.1 1.3-.6 2.5-.6s1.5.6 2.6.6 1.7-1 2.4-2c.7-1.1 1-2.1 1-2.2-.1 0-2.4-.9-2.4-3.6zM14.8 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.4-1z"/></svg>',
    google:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 15H5V9h14v10zM7 11h5v5H7z"/></svg>',
    outlook:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 4v3.5l8 .01V19a1 1 0 0 1-1 1h-7v-2.5l-2 .8V4l9-2v2h-7zm-1.2 5.6A3.2 3.2 0 0 0 8.6 8c-2 0-3.4 1.7-3.4 4s1.4 4 3.4 4 3.2-1.7 3.2-4c0-.9-.2-1.7-.6-2.4zM8.6 14c-1 0-1.6-.9-1.6-2s.6-2 1.6-2 1.5.9 1.5 2-.6 2-1.5 2z"/></svg>',
    download:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 2h14v2H5z"/></svg>'
  };

  function optionEl(opts) {
    var el = document.createElement(opts.href ? "a" : "button");
    el.className = "cal-option" + (opts.recommended ? " cal-option--recommended" : "");
    if (opts.href) {
      el.href = opts.href;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.type = "button";
    }
    el.innerHTML =
      '<span class="cal-option__icon">' + opts.icon + "</span>" +
      '<span class="cal-option__text">' +
        '<span class="cal-option__name">' + opts.name + "</span>" +
        '<span class="cal-option__hint">' + opts.hint + "</span>" +
      "</span>" +
      (opts.recommended ? '<span class="cal-option__badge">Önerilen</span>' : "");
    if (opts.onClick) {
      el.addEventListener("click", opts.onClick);
    }
    return el;
  }

  function buildModalOptions() {
    var wrap = document.getElementById("cal-options");
    if (!wrap) return;
    wrap.innerHTML = "";

    var plat = detectPlatform();

    var apple = {
      name: "Apple Takvim",
      hint: plat.ios ? "iPhone / iPad takvimine ekler" : "iCal / .ics dosyası indirir",
      icon: ICONS.apple,
      recommended: plat.apple,
      onClick: function (e) {
        e.preventDefault();
        downloadICS();
        closeModal();
      }
    };

    var google = {
      name: "Google Takvim",
      hint: "Tarayıcıda Google Takvim'i açar",
      icon: ICONS.google,
      href: googleCalUrl(),
      recommended: plat.android,
      onClick: function () { closeModal(); }
    };

    var outlook = {
      name: "Outlook",
      hint: "Outlook.com takvimine ekler",
      icon: ICONS.outlook,
      href: outlookUrl(),
      onClick: function () { closeModal(); }
    };

    var ics = {
      name: ".ics Dosyası İndir",
      hint: "Diğer tüm takvim uygulamaları",
      icon: ICONS.download,
      onClick: function (e) {
        e.preventDefault();
        downloadICS();
        closeModal();
      }
    };

    var order;
    if (plat.android) {
      order = [google, apple, outlook, ics];
    } else if (plat.apple) {
      order = [apple, google, outlook, ics];
    } else {
      order = [google, apple, outlook, ics];
    }

    order.forEach(function (o) { wrap.appendChild(optionEl(o)); });
  }

  /* ----------------------------------------------------------------
     Modal open / close
     ---------------------------------------------------------------- */
  var modal = document.getElementById("cal-modal");
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    buildModalOptions();
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var firstBtn = modal.querySelector(".cal-option");
    if (firstBtn) firstBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  function initCalendar() {
    var triggers = document.querySelectorAll("[data-add-to-calendar]");
    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });
    if (modal) {
      modal.querySelectorAll("[data-cal-close]").forEach(function (c) {
        c.addEventListener("click", closeModal);
      });
    }
  }

  /* ----------------------------------------------------------------
     Countdown
     ---------------------------------------------------------------- */
  function initCountdown() {
    var root = document.getElementById("countdown");
    if (!root) return;
    var target = new Date(root.getAttribute("data-target")).getTime();

    var elDays = root.querySelector("[data-days]");
    var elHours = root.querySelector("[data-hours]");
    var elMins = root.querySelector("[data-minutes]");
    var elSecs = root.querySelector("[data-seconds]");
    var doneMsg = document.getElementById("countdown-done");

    function tick() {
      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        elDays.textContent = "00";
        elHours.textContent = "00";
        elMins.textContent = "00";
        elSecs.textContent = "00";
        if (doneMsg) doneMsg.hidden = false;
        clearInterval(timer);
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);

      elDays.textContent = pad(days);
      elHours.textContent = pad(hours);
      elMins.textContent = pad(mins);
      elSecs.textContent = pad(secs);
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach(function (i) { i.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (i) { obs.observe(i); });
  }

  /* ----------------------------------------------------------------
     Falling petals (decoration)
     ---------------------------------------------------------------- */
  function initPetals() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    var host = document.querySelector(".petals");
    if (!host) return;
    var count = window.innerWidth < 600 ? 8 : 14;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.left = Math.random() * 100 + "%";
      var dur = 9 + Math.random() * 9;
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = -(Math.random() * dur) + "s";
      var scale = 0.6 + Math.random() * 0.9;
      p.style.transform = "scale(" + scale.toFixed(2) + ")";
      p.style.opacity = (0.3 + Math.random() * 0.35).toFixed(2);
      host.appendChild(p);
    }
  }

  /* ----------------------------------------------------------------
     Boot
     ---------------------------------------------------------------- */
  function boot() {
    initCountdown();
    initCalendar();
    initReveal();
    initPetals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
