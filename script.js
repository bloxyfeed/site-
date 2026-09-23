const API_URL = "https://script.google.com/macros/s/AKfycbzE5n7x4_S4MsmfgvZkz8PiGMsG1b1AQY9lNtg6b4Jhcb_wuMEmN4oXktK3Y7UYFJSyhA/exec?path=news";

const ANIMACOES_EASTER_EGG = {
  halloween: "scary.svg",
  natal: "natal.svg",
  anoNovo: "ano_novo.svg"
};

const nomeSite = document.querySelector("header h1");

if (nomeSite) {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth();

  let sufixo = "";
  let animacaoAtual = null;

  if (mes === 5 && dia === 12) {
    sufixo = " | ❤️";
  } else if (mes === 5) {
    sufixo = " | Pride Month 🏳️‍🌈";
  } else if (mes === 8 && dia === 7) {
    sufixo = " | 🇧🇷 Dia da Independência";
  } else if (mes === 8 && dia === 17) {
    sufixo = " | 🎂";
  } else if (mes === 3) {
    sufixo = " | 🐰";
  } else if (mes === 9 && dia === 31) {
    sufixo = " | 🎃";
    animacaoAtual = ANIMACOES_EASTER_EGG.halloween;
  } else if (mes === 11 && dia === 25) {
    sufixo = " | 🎁";
    animacaoAtual = ANIMACOES_EASTER_EGG.natal;
  } else if (
    (mes === 11 && dia === 31) ||
    (mes === 0 && dia === 1)
  ) {
    sufixo = " | 🥂";
    animacaoAtual = ANIMACOES_EASTER_EGG.anoNovo;
  }

  if (sufixo) {
    const span = document.createElement("span");
    span.className = "easter-egg-title";
    span.textContent = sufixo;
    nomeSite.appendChild(span);
  }

  if (animacaoAtual) {
    nomeSite.style.cursor = "pointer";
    nomeSite.title = "EasterEgg";
    nomeSite.addEventListener("click", () =>
      tocarAnimacaoEasterEgg(animacaoAtual)
    );
  }
}

function tocarAnimacaoEasterEgg(url) {
  if (document.getElementById("overlay-easter-egg")) return;

  const overlay = document.createElement("div");
  overlay.id = "overlay-easter-egg";

  const extensao = url
    .split("?")[0]
    .split("#")[0]
    .split(".")
    .pop()
    .toLowerCase();

  if (["svg", "gif", "png", "webp", "jpg", "jpeg"].includes(extensao)) {
    const img = document.createElement("img");
    img.src = url;
    img.className = "easter-egg-media";
    img.alt = "";
    overlay.appendChild(img);

    setTimeout(() => overlay.remove(), 4500);
  } else if (extensao === "json") {
    const player = document.createElement("dotlottie-player");

    player.setAttribute("src", url);
    player.setAttribute("autoplay", "");
    player.setAttribute("loop", "false");
    player.className = "easter-egg-media";

    player.addEventListener("complete", () => overlay.remove());
    setTimeout(() => overlay.remove(), 4500);

    overlay.appendChild(player);
  } else {
    console.error("Formato não suportado:", url);
    return;
  }

  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}

function formatarResumo(texto) {
  if (!texto) return "";

  const linhas = texto
    .split(/\r?\n/)
    .filter(linha => linha.trim());

  return linhas.length <= 1 ? texto : `${linhas[0]}\n\n...`;
}

function formatarData(data) {
  return data
    ? new Date(data).toLocaleDateString("pt-BR")
    : "";
}

async function carregarNoticias() {
  const res = await fetch(API_URL, {
    method: "GET",
    redirect: "follow"
  });

  if (!res.ok) {
    throw new Error("Falha ao buscar notícias");
  }

  const data = await res.json();
  const lista = data.news || data.noticias || (Array.isArray(data) ? data : []);

  return lista.map(n => {
    const destaque = n.destaque ?? n.Destaque;

    return {
      id: String(n.id || n.ID || ""),
      titulo: n.nome || n.titulo || n.Nome || n.Titulo || "Sem título",
      categoria: n.categoria || n.Categoria || "Geral",
      resumo: n.resumo || n.Resumo || "",
      imagem: n.imagem || n.Imagem || "",
      autor: n.autor || n.Autor || "Anônimo",
      data: formatarData(n.data || n.Data),
      destaque:
        destaque === true ||
        String(destaque).toLowerCase() === "true"
    };
  });
}

function renderizarDestaque(noticias) {
function renderizarDestaque(noticias){
  const titulo=document.querySelector("#destaqueTitulo"),
        resumo=document.querySelector("#destaqueResumo"),
        btn=document.querySelector("#btnLerDestaque");

  // Remove a animação de carregamento assim que houver retorno
  titulo.classList.remove("skeleton", "skeleton-title");
  resumo.classList.remove("skeleton", "skeleton-text");

  if(!noticias?.length){
    titulo.textContent="Nenhuma notícia encontrada";
    resumo.textContent="Verifique o backend ou o status de publicação no Notion.";
    btn.disabled=true;
    btn.onclick=null;
    return;
  }
  const destaque=noticias.find(n=>n.destaque)||noticias[0];
  titulo.textContent=destaque.titulo;
  resumo.textContent=formatarResumo(destaque.resumo);
  btn.disabled=false;
  btn.onclick=()=>location.href=`noticia.html?id=${encodeURIComponent(destaque.id)}`;
}

function criarCardNoticia(noticia) {
  const artigo = document.createElement("article");
  artigo.className = "noticia";

  artigo.innerHTML = `
    ${noticia.imagem ? `<img src="${noticia.imagem}" alt="${noticia.titulo}">` : ""}
    <h3>${noticia.titulo}</h3>
    <p>${noticia.categoria}</p>
    <p class="card-resumo">${formatarResumo(noticia.resumo)}</p>
    <small>Por ${noticia.autor} • ${noticia.data}</small>
    <a class="btn-ler" href="noticia.html?id=${encodeURIComponent(noticia.id)}">
      Ler notícia
    </a>
  `;

  return artigo;
}

function renderizarLista(noticias) {
  const lista = document.querySelector("#listaNoticias");
  lista.innerHTML = "";

  if (!noticias?.length) {
    lista.innerHTML = "<p>Nenhuma notícia encontrada.</p>";
    return;
  }

  const semDestaque = noticias.filter(n => !n.destaque);

  semDestaque.forEach(noticia => {
    lista.appendChild(criarCardNoticia(noticia));
  });

  if (!lista.children.length) {
    lista.innerHTML = "<p>Não há outras notícias além do destaque.</p>";
  }
}

function distanciaLevenshtein(a, b) {
  const matrix = Array.from(
    { length: b.length + 1 },
    (_, i) => [i]
  );

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

function palavraProxima(termo, texto) {
  const termoLower = termo.toLowerCase();
  const maxErros = termoLower.length <= 4 ? 1 : 2;

  return texto.toLowerCase().split(/\s+/).some(palavra => {
    if (palavra.includes(termoLower)) return true;

    if (Math.abs(palavra.length - termoLower.length) > maxErros) {
      return false;
    }

    return distanciaLevenshtein(termoLower, palavra) <= maxErros;
  });
}

function configurarBusca(noticias) {
  const campoBusca = document.querySelector("#campoBusca");
  if (!campoBusca) return;

  campoBusca.addEventListener("input", () => {
    const termo = campoBusca.value.trim().toLowerCase();

    if (!termo) {
      renderizarLista(noticias);
      return;
    }

    const resultados = noticias.filter(noticia => {
      const texto = `${noticia.titulo} ${noticia.resumo} ${noticia.categoria}`;
      return palavraProxima(termo, texto);
    });

    renderizarLista(resultados);
  });
}

async function iniciar(){
  try{
    const noticias=await carregarNoticias();
    renderizarDestaque(noticias);
    renderizarLista(noticias);
    configurarBusca(noticias);
  }catch(err){
    console.error("Erro na requisição:",err);
    const titulo=document.querySelector("#destaqueTitulo"),
          resumo=document.querySelector("#destaqueResumo");
    
    titulo.classList.remove("skeleton", "skeleton-title");
    resumo.classList.remove("skeleton", "skeleton-text");

    titulo.textContent="Erro ao carregar notícias";
    resumo.textContent="Verifique sua conexão com a internet e tente novamente.";
    document.querySelector("#btnLerDestaque").disabled=true;
  }
}

iniciar();

let ultimaRolagem = window.scrollY;
let bloqueioScroll = false;

window.addEventListener("scroll", () => {
  if (bloqueioScroll) return;

  bloqueioScroll = true;

  requestAnimationFrame(() => {
    const header = document.querySelector("header");
    const rolagemAtual = window.scrollY;

    if (!header) {
      bloqueioScroll = false;
      return;
    }

    if (rolagemAtual <= 10 || rolagemAtual < ultimaRolagem) {
      header.classList.remove("header-hidden");
    } else if (rolagemAtual > ultimaRolagem) {
      header.classList.add("header-hidden");
    }

    ultimaRolagem = rolagemAtual;
    bloqueioScroll = false;
  });
}, { passive: true });
