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

  const CHAVE_SOLICITACAO = "Forma de solicitação";

  const CHAVE_LINK = "";

  const LINK_ONLINE_TESTE = "https://www.sapezal.mt.gov.br/portal/servicos/53/protocolo-central/";

  const btnToggleSearch = document.getElementById("btnToggleSearch");
  const btnConfirmarBusca = document.getElementById("btnConfirmarBusca");
  const searchContainer = document.querySelector(".search-retratil");

  let filtroModalidade = "todos";

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
};

function linkificarTexto(texto) {
  if (!texto) return texto;

  const urlRegex =
    /((https?:\/\/|www\.)[^\s]+)/g;

  return texto.replace(urlRegex, (url) => {
    const href = url.startsWith("http")
      ? url
      : `https://${url}`;

    return `
      <a
        href="${href}"
        target="_blank"
        rel="noopener noreferrer"
        class="link-detectado"
      >
        ${url}
      </a>
`});
};

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

class Solicitacao {
  constructor(registro) {
    this.forma = (registro[CHAVE_SOLICITACAO] || "").toLowerCase();

    // usa link real do JSON ou, se não existir, o link de teste
    this.linkOnline =
      registro[CHAVE_LINK] || LINK_ONLINE_TESTE || null;
  }

  isOnline() {
    return (
      this.forma.includes("online") ||
      this.forma.includes("digital") ||
      this.forma.includes("internet") ||
      this.forma.includes("protocolo")
    );
  }

  isPresencial() {
    return this.forma.includes("presencial");
  }

  atendeModalidade(filtro) {
    if (filtro === "todos") return true;
    if (filtro === "online") return this.isOnline();
    if (filtro === "presencial") return this.isPresencial();
    return true;
  }

  /**
   * Gera os ícones com tooltip e link (quando houver)
   */
  renderIcones() {
    let html = "";

    // ✅ ÍCONE ONLINE (COM LINK + TOOLTIP)
    if (this.isOnline()) {
      html += `
        <a
          href="${this.linkOnline}"
          target="_blank"
          rel="noopener noreferrer"
          class="text-success ms-2"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Solicitar serviço online"
          aria-label="Solicitar serviço online"
        >
          <i class="bi bi-globe"></i>
        </a>
      `;
    }

    // ✅ ÍCONE PRESENCIAL (COM TOOLTIP)
    if (this.isPresencial()) {
      html += `
        <span
          class="text-primary ms-2"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Atendimento presencial"
          aria-label="Atendimento presencial"
        >
          <i class="bi bi-building"></i>
        </span>
      `;
    }

    return html;
  }
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
  const filtrados = dados.filter(d => {

    // 1. filtros hierárquicos
    if (filtroSecretaria.value &&
        d[CHAVE_SECRETARIA] !== filtroSecretaria.value) {
      return false;
    }

    if (filtroUnidade.value &&
        d[CHAVE_UNIDADE] !== filtroUnidade.value) {
      return false;
    }

    if (filtroServico.value &&
        d[CHAVE_SERVICO] !== filtroServico.value) {
      return false;
    }

    // 2. filtro de modalidade (BADGES)
    const solicitacao = new Solicitacao(d);
    if (!solicitacao.atendeModalidade(filtroModalidade)) {
      return false;
    }

    // 3. busca textual
    const termo = normalizarTexto(buscaServico.value);
    if (termo) {
      const titulo = normalizarTexto(d[CHAVE_SERVICO]);
      if (!titulo.includes(termo)) {
        return false;
      }
    }

    return true;
  });

  renderizarServicos(filtrados);
  atualizarContador(filtrados.length, buscaServico.value);
  atualizarIndicadorFiltros();
}


    // reaplica filtros
   

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
    const solicitacao = new Solicitacao(registro);

    const tituloServico = registro[CHAVE_SERVICO] || "Serviço";
    const iconesServico = solicitacao.renderIcones();

     
  
    

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
          <span class="flex-grow-1">
          ${tituloServico}
          </span>
          ${iconesServico}

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
                  ${linkificarTexto(valor)}
                </div>
              </div>
            `).join("")}
        </div>
      </div>
    `;

    container.appendChild(item);
  });
};

// indicar serviço online
function possuiSolicitacaoOnline(registro) {
  const texto = (
    registro[CHAVE_SOLICITACAO] || ""
  ).toLowerCase();

  return (
    texto.includes("online") ||
    texto.includes("eletr") ||
    texto.includes("internet") ||
    texto.includes("digital") ||
    texto.includes("protocolo")
  );
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



document.querySelectorAll(".filtro-modalidade").forEach(badge => {

  badge.addEventListener("click", () => {

    // remove ativo de todas
    document.querySelectorAll(".filtro-modalidade").forEach(b => {
      b.classList.remove("ativo");
      b.setAttribute("aria-pressed", "false");
    });

    // ativa a clicada
    badge.classList.add("ativo");
    badge.setAttribute("aria-pressed", "true");

    // atualiza estado
    filtroModalidade = badge.dataset.modalidade;

    // reaplica filtros
    aplicarFiltros();
  });
});

console.log(filtroModalidade);

function atualizarIndicadorFiltros() {
  let total = 0;

  // busca textual
  if (buscaServico && buscaServico.value.trim()) total++;

  // filtros select
  if (filtroSecretaria && filtroSecretaria.value) total++;
  if (filtroUnidade && filtroUnidade.value) total++;
  if (filtroServico && filtroServico.value) total++;

  // filtro por modalidade (badges)
  if (typeof filtroModalidade !== "undefined" && filtroModalidade !== "todos") {
    total++;
  }

  const indicador = document.getElementById("indicadorFiltros");
  if (!indicador) return;

  if (total === 0) {
    indicador.textContent = "Nenhum filtro aplicado.";
  } else if (total === 1) {
    indicador.textContent = "1 filtro aplicado.";
  } else {
    indicador.textContent = `${total} filtros aplicados.`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );

  tooltipTriggerList.forEach(el => {
    new bootstrap.Tooltip(el);
  });
});