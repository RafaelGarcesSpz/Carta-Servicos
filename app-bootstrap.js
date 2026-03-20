let dados = [];

/* =========================
   CHAVES DO JSON (EXCEL)
========================= */
const CHAVE_SECRETARIA =
  "0.1 - Unidade prestadora do serviço – Secretaria (art. 7º, §1º)";

const CHAVE_UNIDADE =
  "0.2 - Unidade/Departamento responsável (art. 7º, §1º)";

const CHAVE_SERVICO =
  "1 - Nome do serviço (art. 7º, §2º, I)";

/* =========================
   CARREGAMENTO
========================= */
fetch("servicos.json")
  .then(res => res.json())
  .then(json => {
    dados = json;
    inicializarFiltros();
    renderizarServicos(dados);
    atualizarData();
  });

function atualizarData() {
  document.getElementById("dataAtualizacao").textContent =
    new Date().toLocaleDateString("pt-BR");
}

/* =========================
   FILTROS ANINHADOS
========================= */
function inicializarFiltros() {
  preencherSecretarias();

  filtroSecretaria.addEventListener("change", onSecretariaChange);
  filtroUnidade.addEventListener("change", onUnidadeChange);
  filtroServico.addEventListener("change", aplicarFiltros);
}

function preencherSecretarias() {
  preencherSelect(
    filtroSecretaria,
    dados.map(d => d[CHAVE_SECRETARIA])
  );
}

function preencherUnidades(secretaria) {
  const unidades = dados
    .filter(d => d[CHAVE_SECRETARIA] === secretaria)
    .map(d => d[CHAVE_UNIDADE]);

  preencherSelect(filtroUnidade, unidades);
}

function preencherServicos(secretaria, unidade) {
  const servicos = dados
    .filter(d =>
      (!secretaria || d[CHAVE_SECRETARIA] === secretaria) &&
      (!unidade || d[CHAVE_UNIDADE] === unidade)
    )
    .map(d => d[CHAVE_SERVICO]);

  preencherSelect(filtroServico, servicos);
}

function preencherSelect(select, valores) {
  select.innerHTML = `<option value="">Todos</option>`;

  [...new Set(valores.filter(Boolean))].forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
}

function onSecretariaChange() {
  const secretaria = filtroSecretaria.value;

  filtroUnidade.innerHTML = `<option value="">Todas</option>`;
  filtroServico.innerHTML = `<option value="">Todos</option>`;

  if (secretaria) {
    preencherUnidades(secretaria);
    preencherServicos(secretaria, null);
  }

  aplicarFiltros();
}

function onUnidadeChange() {
  const secretaria = filtroSecretaria.value;
  const unidade = filtroUnidade.value;

  filtroServico.innerHTML = `<option value="">Todos</option>`;

  if (unidade) {
    preencherServicos(secretaria, unidade);
  }

  aplicarFiltros();
}

/* =========================
   APLICA FILTRO FINAL
========================= */
function aplicarFiltros() {
  const secretaria = filtroSecretaria.value;
  const unidade = filtroUnidade.value;
  const servico = filtroServico.value;

  const filtrados = dados.filter(d =>
    (!secretaria || d[CHAVE_SECRETARIA] === secretaria) &&
    (!unidade || d[CHAVE_UNIDADE] === unidade) &&
    (!servico || d[CHAVE_SERVICO] === servico)
  );

  renderizarServicos(filtrados);
}

/* =========================
   ACCORDION BOOTSTRAP
========================= */
function renderizarServicos(lista) {
  const container = document.getElementById("listaServicos");
  container.innerHTML = "";

  lista.forEach((registro, index) => {
    const item = document.createElement("div");
    item.className = "accordion-item";

    const headerId = `heading-${index}`;
    const collapseId = `collapse-${index}`;

    item.innerHTML = `
      <h2 class="accordion-header" id="${headerId}">
        <button class="accordion-button collapsed fw-semibold"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#${collapseId}">
          ${registro[CHAVE_SERVICO] || "Serviço"}
        </button>
      </h2>

      <div id="${collapseId}"
        class="accordion-collapse collapse"
        data-bs-parent="#listaServicos">
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