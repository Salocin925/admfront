import { API_URL } from "../config";

const URL_PRODUTOS = `${API_URL}/api/produtos`;

async function requisitar(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
  }

  return dados;
}

export async function listarProdutos() {
  const dados = await requisitar(URL_PRODUTOS);
  return dados.produtos;
}

export async function criarProduto(produto) {
  return requisitar(URL_PRODUTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
}

export async function atualizarProduto(id, produto) {
  return requisitar(`${URL_PRODUTOS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
}

export async function removerProduto(id) {
  return requisitar(`${URL_PRODUTOS}/${id}`, { method: "DELETE" });
}