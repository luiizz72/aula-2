const sim = document.getElementById("sim");
const nao = document.getElementById("nao");
const continuar = document.getElementById("continuar");
const dataInput = document.getElementById("data");

const telas = document.querySelectorAll(".tela");

let etapaNao = 0;
let finalAtivado = false;

let dataEscolhida = "";
let comidaEscolhida = "";

const mensagensNao = [
  "Tem certeza?",
  "Pense bem...",
  "Vou te dar mais uma chance 😏",
  "Não é tão difícil assim, né? 😢",
];

function trocarTela(id) {
  telas.forEach((t) => t.classList.remove("ativa"));
  const alvo = document.getElementById(id);
  if (alvo) alvo.classList.add("ativa");
}

function fugir() {
  if (finalAtivado) return;

  const btnNao = nao;
  const container = document.querySelector(".botoes");
  if (!btnNao || !container) return;

  if (etapaNao < mensagensNao.length) {
    btnNao.textContent = mensagensNao[etapaNao];
  }

  etapaNao++;

  const distancia = 90 + etapaNao * 30;

  const x = Math.random() * distancia * 2 - distancia;
  const y = Math.random() * distancia * 2 - distancia;

  btnNao.style.transition = "0.15s ease";
  btnNao.style.transform = `translate(${x}px, ${y}px)`;

  if (etapaNao >= mensagensNao.length) {
    ativarSimFinal();
  }
}

function ativarSimFinal() {
  finalAtivado = true;

  const container = document.querySelector(".botoes");
  if (!container) return;

  container.innerHTML = "";

  const criarSim = () => {
    const btn = document.createElement("button");
    btn.textContent = "Sim";
    btn.className = "botao-sim-final";
    btn.onclick = () => trocarTela("dataTela");
    return btn;
  };

  const sim1 = criarSim();

  const ou = document.createElement("span");
  ou.textContent = "OU";
  ou.className = "ou";

  const sim2 = criarSim();

  container.append(sim1, ou, sim2);
}

function validarData(valor) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;

  const [d, m, a] = valor.split("/").map(Number);
  const data = new Date(a, m - 1, d);

  return (
    data.getDate() === d &&
    data.getMonth() === m - 1 &&
    data.getFullYear() === a
  );
}

dataInput.addEventListener("input", () => {
  let v = dataInput.value.replace(/\D/g, "");

  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5);
  if (v.length > 10) v = v.slice(0, 10);

  dataInput.value = v;

  continuar.disabled = !validarData(v);
});

sim.onclick = () => trocarTela("dataTela");

nao.addEventListener("mouseenter", fugir);
nao.addEventListener("click", fugir);

continuar.onclick = () => {
  const valor = dataInput.value;

  if (!validarData(valor)) return;

  dataEscolhida = valor;
  trocarTela("comida");
};

async function enviarEmail() {
  try {
    await fetch("https://formsubmit.co/ajax/2d8d413b9ad966927bb8039ad893e62c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: dataEscolhida,
        comida: comidaEscolhida,
        _subject: "Novo convite aceito ❤️",
        _captcha: "false",
      }),
    });
  } catch (e) {
    console.log("Erro ao enviar:", e);
  }
}

document.querySelectorAll(".comidas button").forEach((btn) => {
  btn.addEventListener("click", async () => {
    let comida = btn.dataset.comida;

    if (comida === "Outro") {
      comida = "Escolhe você ❤️";
    }

    comidaEscolhida = comida;

    document.querySelectorAll(".comidas button").forEach((b) => {
      b.style.background = "rgba(255,255,255,0.06)";
      b.style.transform = "scale(1)";
    });

    btn.style.background = "rgba(255, 77, 109, 0.25)";
    btn.style.transform = "scale(1.05)";

    document.getElementById("resumo").innerHTML = `
      <p>📅 <strong>Data:</strong> ${dataEscolhida}</p>
      <p>🍽️ <strong>Comida:</strong> ${comidaEscolhida}</p>
    `;

    trocarTela("final");
    await enviarEmail();
  });
});
