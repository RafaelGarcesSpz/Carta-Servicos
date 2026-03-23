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

  
const CHAVE_NOME_POPULAR =
  "1.1 - Nomes populares do serviço (art. 7º, §2º, I)";


const CHAVE_DESCRICAO =
  "2 - Descrição do serviço (art. 7º, §1º; §2º, I)";

//Normalizar texto para pesquisar digitação errada

function normalizarTexto(texto) {
  if (!texto) return "";

  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .trim();
};
// destacar o texto pesquisado pelo usuario
function destacarTitulo(textoOriginal, termoBusca) {
  if (!textoOriginal || !termoBusca) return textoOriginal;

  const termo = termoBusca.trim();
  if (!termo) return textoOriginal;

  // Escapa caracteres especiais do regex
  const termoEscapado = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Regex case-insensitive, literal
  const regex = new RegExp(termoEscapado, "gi");

  // Só destaca se houver correspondência literal
  if (!regex.test(textoOriginal)) {
    return textoOriginal;
  }

  return textoOriginal.replace(regex, match => {
    return `<mark class="destaque-busca">${match}</mark>`;
  });
}


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
  document.getElementById("buscaServico")
  .addEventListener("input", aplicarFiltros);

  
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

// aplicar os filtros de busca

function aplicarFiltros() {
  const secretaria = filtroSecretaria.value;
  const unidade = filtroUnidade.value;
  const servico = filtroServico.value;
  

  const termoBusca = normalizarTexto(
    document.getElementById("buscaServico").value
  );

  const filtrados = dados.filter(d => {

    const nomeServico = normalizarTexto(d[CHAVE_SERVICO]);

    const atendeBusca =
      !termoBusca || nomeServico.includes(termoBusca);

    return (
      (!secretaria || d[CHAVE_SECRETARIA] === secretaria) &&
      (!unidade || d[CHAVE_UNIDADE] === unidade) &&
      (!servico || d[CHAVE_SERVICO] === servico) &&
      atendeBusca
    );
  });

  renderizarServicos(filtrados);
  atualizarContador(filtrados.length, buscaServico.value);

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

   

const tituloOriginal = registro[CHAVE_SERVICO] || "Serviço";

const tituloComDestaque = destacarTitulo(
  tituloOriginal,
  document.getElementById("buscaServico").value
);

  item.innerHTML = `
    <h2 class="accordion-header">
      <button
        class="accordion-button collapsed fw-semibold"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#${collapseId}">
        ${tituloComDestaque}
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
  
    if (lista.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info text-center">
        Nenhum serviço encontrado com os critérios informados.
      </div>
    `;
    return;
  }
}



function atualizarContador(total, termoBusca = "") {
  const contador = document.getElementById("contadorResultados");
  if (!contador) return;

  if (total === 0) {
    contador.textContent = termoBusca
      ? "Nenhum serviço encontrado para a busca informada."
      : "Nenhum serviço encontrado.";
    return;
  }

  if (total === 1) {
    contador.textContent = "1 serviço encontrado.";
    return;
  }

  contador.textContent = `${total} serviços encontrados.`;
}
