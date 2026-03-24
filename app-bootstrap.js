let dados = [];

/* =========================
   CHAVES DO JSON (EXCEL)
========================= */
  const CHAVE_SECRETARIA =
    "Secretaria";
  const CHAVE_UNIDADE =
   "Departamento";
  const CHAVE_SERVICO =
    "Nome do serviço";
  const CHAVE_NOME_POPULAR =
    " Nomes populares";
  const CHAVE_DESCRICAO =
   "Descrição";

  const btnToggleSearch = document.getElementById("btnToggleSearch");
  const btnConfirmarBusca = document.getElementById("btnConfirmarBusca");
  const searchContainer = document.querySelector(".search-retratil");

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

  // escapa caracteres especiais do termo
  const termoEscapado = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // regex literal, case-insensitive
  const regex = new RegExp(termoEscapado, "gi");

  return textoOriginal.replace(regex, match => {
    return `<span class="destaque-texto">${match}</span>`;
  });
}


/* =========================
   CARREGAMENTO
========================= */
fetch("servicos_v2.json")
  .then(res => res.json())
  .then(json => {
    dados = json;
    inicializarFiltros();
    renderizarServicos(dados);
    atualizarData();
    atualizarEstadoFiltros();
  });

function atualizarData() {
  document.getElementById("dataAtualizacao").textContent =
    new Date().toLocaleDateString("pt-BR");
};

// modificar habilitação do filtro 
function atualizarEstadoFiltros() {
  // Unidade depende APENAS da Secretaria
  if (filtroSecretaria.value) {
    filtroUnidade.disabled = false;
  } else {
    filtroUnidade.disabled = true;
    filtroUnidade.value = "";
  }

  // Serviço depende APENAS da Unidade
  if (filtroUnidade.value) {
    filtroServico.disabled = false;
  } else {
    filtroServico.disabled = true;
    filtroServico.value = "";
  }
};

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
  document
    .getElementById("btnLimparFiltros")
    .addEventListener("click", limparFiltros)
};

function limparFiltros() {
  // limpa campo de busca
  document.getElementById("buscaServico").value = "";

  // limpa selects
  filtroSecretaria.value = "";
  filtroUnidade.innerHTML = `<option value="">Todas</option>`;
  filtroServico.innerHTML = `<option value="">Todos</option>`;

  // recarrega filtros iniciais
  preencherSecretarias();

  atualizarEstadoFiltros();
  // renderiza todos os serviços
  renderizarServicos(dados);
 
  // atualiza contador
  atualizarContador(dados.length, "");
 
};

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
};

function preencherServicos(secretaria, unidade) {
  const servicos = dados
    .filter(d =>
      (!secretaria || d[CHAVE_SECRETARIA] === secretaria) &&
      (!unidade || d[CHAVE_UNIDADE] === unidade)
    )
    .map(d => d[CHAVE_SERVICO]);

  preencherSelect(filtroServico, servicos);
};

function preencherSelect(select, valores) {
  select.innerHTML = `<option value="">Todos</option>`;

  [...new Set(valores.filter(Boolean))].forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
};

function onSecretariaChange() {
  const secretaria = filtroSecretaria.value;

  filtroUnidade.innerHTML = `<option value="">Todas</option>`;
  filtroServico.innerHTML = `<option value="">Todos</option>`;
  filtroServico.disabled = true;
  if (secretaria) {
    preencherUnidades(secretaria);
    
  }
  atualizarEstadoFiltros();
  aplicarFiltros();
  
};

function onUnidadeChange() {
  const secretaria = filtroSecretaria.value;
  const unidade = filtroUnidade.value;

  filtroServico.innerHTML = `<option value="">Todos</option>`;

  if (unidade) {
    preencherServicos(secretaria, unidade);
  }
  atualizarEstadoFiltros();
  aplicarFiltros();
};

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

};



/* =========================
   ACCORDION BOOTSTRAP
========================= */
function renderizarServicos(lista) {
  const container = document.getElementById("listaServicos");
  container.innerHTML = "";

  // termo de busca (normalizado)
  const termoBusca = document
    .getElementById("buscaServico")
    ?.value
    ?.trim() || "";

  const termoNormalizado = normalizarTexto(termoBusca);

  lista.forEach((registro, index) => {
    const item = document.createElement("div");
    item.className = "accordion-item";

    /* =========================
       VERIFICA SE CORRESPONDE À BUSCA
    ========================== */
    let correspondeBusca = false;

    if (termoNormalizado) {
      const tituloNormalizado = normalizarTexto(
        registro[CHAVE_SERVICO] || ""
      );

      correspondeBusca = tituloNormalizado.includes(termoNormalizado);
    }

    // aplica destaque por BORDA se houver busca
    if (correspondeBusca) {
      item.classList.add("servico-destaque");
    }

    /* =========================
       IDs DO ACCORDION
    ========================== */
    const headerId = `heading-${index}`;
    const collapseId = `collapse-${index}`;

    /* =========================
       TÍTULO DO SERVIÇO (SEM DESTAQUE DE TEXTO)
    ========================== */
    const tituloServico =
      registro[CHAVE_SERVICO] || "Serviço";

    /* =========================
       MONTA HTML
    ========================== */
    item.innerHTML = `
      <h2 class="accordion-header" id="${headerId}">
        <button
          class="accordion-button collapsed fw-semibold"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#${collapseId}"
          aria-expanded="false"
          aria-controls="${collapseId}"
        >
          ${tituloServico}
        </button>
      </h2>

      <div
        id="${collapseId}"
        class="accordion-collapse collapse"
        aria-labelledby="${headerId}"
        data-bs-parent="#listaServicos"
      >
        <div class="accordion-body">
          ${Object.entries(registro)
            .filter(([chave, valor]) => valor && chave !== CHAVE_SERVICO)
            .map(([chave, valor]) => `
              <div class="row mb-2">
                <div class="col-12 col-md-4 fw-semibold text-primary">
                  ${chave}
                </div>
                <div class="col-12 col-md-8">
                  ${valor}
                </div>
              </div>
            `).join("")}
        </div>
      </div>
    `;

    container.appendChild(item);
  });
};


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
};

btnToggleSearch.addEventListener("click", () => {
  const ativo = searchContainer.classList.toggle("ativo");
  const icon = btnToggleSearch.querySelector("i");

  if (ativo) {
    icon.classList.replace("bi-search", "bi-x");
    buscaServico.focus();
  } else {
    icon.classList.replace("bi-x", "bi-search");
    buscaServico.value = "";
    aplicarFiltros();
    atualizarIndicadorFiltros();
  }
});

btnConfirmarBusca.addEventListener("click", () => {
  aplicarFiltros();
  atualizarIndicadorFiltros();
});

buscaServico.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    aplicarFiltros();
    atualizarIndicadorFiltros();
  }
});


// GARANTIA DE ESTADO INICIAL
searchContainer.classList.remove("ativo");