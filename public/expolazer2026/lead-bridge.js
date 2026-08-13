/* Ponte de leads da página Expolazer 2026 (11/08/2026).
 *
 * O formulário abre o WhatsApp (fluxo do main-*.js, intocado). Esta ponte
 * garante que TODO preenchimento também vire lead no painel (tabela `leads`,
 * via edge function lead-submit) — inclusive de quem desiste no último toque
 * do WhatsApp. Sem widget de captcha: lead-submit aceita sem token por
 * desenho (honeypot + validação de servidor são o fallback), e o campo
 * honeypot `site` viaja junto.
 *
 * Registrado em CAPTURE no document: roda ANTES do handler do main, valida o
 * WhatsApp (obrigatório — o painel exige e-mail ou telefone), dispara o POST
 * com keepalive e deixa o fluxo seguir para o WhatsApp normalmente.
 */
(function () {
  "use strict";

  var FN_URL = "https://zibtysewpbeycngtbjjk.supabase.co/functions/v1/lead-submit";
  // Chave publishable/anon — pública por construção (é a mesma do bundle do site).
  var ANON =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnR5c2V3cGJleWNuZ3RiamprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDE3NjMsImV4cCI6MjA5MzkxNzc2M30.NGI4k2HuA2DlNlIXS5twA5ZxB3mEn4vbHgyHH1e6ytA";

  function campo(form, nome) {
    var el = form.elements[nome];
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function marcaInvalido(input) {
    input.setAttribute("aria-invalid", "true");
    input.focus();
    var limpa = function () {
      input.removeAttribute("aria-invalid");
      input.removeEventListener("input", limpa);
    };
    input.addEventListener("input", limpa);
  }

  document.addEventListener(
    "submit",
    function (ev) {
      var form = ev.target;
      if (!form || form.id !== "contactForm") return;

      var nome = campo(form, "nome");
      if (!nome) return; // o handler do main mostra o erro de nome

      var zap = campo(form, "whatsapp");
      var digitos = zap.replace(/\D/g, "");
      if (digitos.length < 8) {
        // Bloqueia aqui: sem contato o lead não entra no painel.
        ev.preventDefault();
        ev.stopImmediatePropagation();
        marcaInvalido(form.elements.whatsapp);
        return;
      }

      // Cidade/UF no formato livre "Campinas/SP" → separa quando der.
      var cidadeRaw = campo(form, "cidade");
      var cidade = cidadeRaw;
      var uf = null;
      var m = cidadeRaw.match(/^(.*?)[\s]*[\/\-][\s]*([A-Za-z]{2})$/);
      if (m) {
        cidade = m[1].trim();
        uf = m[2].toUpperCase();
      }

      var interesse = campo(form, "interesse");
      var mensagem = campo(form, "mensagem");

      var corpo = {
        token: "",
        hp: campo(form, "site"), // honeypot: humano manda vazio
        lead: {
          type: "contato",
          nome: nome,
          telefone: zap,
          email: null,
          cidade: cidade || null,
          uf: uf,
          empresa: campo(form, "empresa") || null,
          mensagem:
            "[Expolazer 2026 — estande] Quero falar sobre: " +
            interesse +
            (mensagem ? " — " + mensagem : ""),
          origem: "expolazer2026",
          payload: { interesse: interesse, fonte: "form-feira" },
        },
      };

      // keepalive: sobrevive à página perder o foco quando o WhatsApp abre.
      try {
        fetch(FN_URL, {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: ANON,
            Authorization: "Bearer " + ANON,
          },
          body: JSON.stringify(corpo),
        }).catch(function () { /* silencioso: o WhatsApp segue sendo o canal principal */ });
      } catch (_) { /* fetch indisponível: segue o fluxo do WhatsApp */ }
    },
    true // capture: roda antes do handler do main
  );
})();
