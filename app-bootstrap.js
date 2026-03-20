const CHAVE_SERVICO =
  "1 - Nome do serviço (art. 7º, §2º, I)";

fetch("dados.json")
  .then(res => res.json())
  .then(dados => {
    renderizarServicos(dados);
    atualizarData();
  });

function atualizarData() {
  document.getElementById("dataAtualizacao").textContent =
    new Date().toLocaleDateString("pt-BR");
}

function renderizarServicos(dados) {
  const container = document.getElementById("listaServicos");
  container.innerHTML = "";

  dados.forEach((registro, index) => {
    const item = document.createElement("div");
    item.className = "accordion-item";

    const headerId = `heading-${index}`;
    const collapseId = `collapse-${index}`;

    item.innerHTML = `
      <h2 class="accordion-header" id="${headerId}">
        <button
          class="accordion-button collapsed fw-semibold"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#${collapseId}"
        >
          ${registro[CHAVE_SERVICO] || "Serviço"}
        </button>
      </h2>

      <div
        id="${collapseId}"
        class="accordion-collapse collapse"
        data-bs-parent="#listaServicos"
      >
        <div class="accordion-body">
          ${Object.entries(registro)
            .filter(([c, v]) => v && c !== CHAVE_SERVICO)
            .map(([c, v]) => `
              <div class="row mb-2">
                <div class="col-12 col-md-4 fw-semibold text-primary">
                  ${c}
                </div>
                <div class="col-12 col-md-8">
                  ${v}
                </div>
              </div>
            `).join("")}
        </div>
      </div>
    `;

    container.appendChild(item);
  });
}