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
   CARREGAMENTO DO JSON
========================= */
fetch("servicos.json")
  .then(res => res.json())
  .then(json => {
    dados = json;
    inicializarFiltros();
    renderizarServicos(dados);
    atualizarData();
  });

  /* =========================
   DATA DA ÚLTIMA ATUALIZAÇÃO
========================= */
function atualizarData() {
  const data = new Date();

  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const el = document.getElementById("dataAtualizacao");
  if (el) {
    el.textContent = dataFormatada;
  }
}

/* =========================
   INICIALIZAÇÃO
========================= */
function inicializarFiltros() {
  preencherSecretarias();

  filtroSecretaria.addEventListener("change", onSecretariaChange);
  filtroUnidade.addEventListener("change", onUnidadeChange);
  filtroServico.addEventListener("change", aplicarFiltros);
}

/* =========================
   PREENCHIMENTO DOS FILTROS
========================= */
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

  [...new Set(valores.filter(Boolean))].forEach(valor => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });
}

/* =========================
   EVENTOS ANINHADOS
========================= */
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
   APLICAÇÃO FINAL DOS FILTROS
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
   RENDERIZAÇÃO GENÉRICA
========================= */
function renderizarServicos(lista) {
  const container = document.getElementById("listaServicos");
  container.innerHTML = "";

  lista.forEach((registro, index) => {
    const item = document.createElement("div");
    item.className = "accordion-item";

    /* =========================
       CABEÇALHO (clicável)
    ========================= */
    const header = document.createElement("button");
    header.className = "accordion-header";
    header.setAttribute("aria-expanded", "false");

    header.innerHTML = `
      <span class="accordion-titulo">
        ${registro[CHAVE_SERVICO] || "Serviço"}
      </span>
      <span class="accordion-icone">+</span>
    `;

    /* =========================
       CONTEÚDO (oculto)
    ========================= */
    const content = document.createElement("div");
    content.className = "accordion-content";

    Object.entries(registro).forEach(([coluna, valor]) => {
      if (valor === null || valor === undefined) return;
      if (coluna === CHAVE_SERVICO) return;

      const linha = document.createElement("div");
      linha.className = "campo-servico";

      if (coluna.includes("O serviço é gratuito")) {
        linha.classList.add("gratuidade");
      }

      linha.innerHTML = `
        <span class="campo-titulo">${coluna}</span>
        <span class="campo-valor">${valor}</span>
      `;

      content.appendChild(linha);
    });

    /* =========================
       EVENTO DO ACCORDION
    ========================= */
    header.addEventListener("click", () => {
      const aberto = header.getAttribute("aria-expanded") === "true";

      header.setAttribute("aria-expanded", String(!aberto));
      content.style.maxHeight = aberto ? null : content.scrollHeight + "px";
      header.querySelector(".accordion-icone").textContent = aberto ? "+" : "−";
    });

    item.appendChild(header);
    item.appendChild(content);
    container.appendChild(item);
  });
}
