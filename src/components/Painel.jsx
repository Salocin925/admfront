//  Quando o filho avisa "salvei!", o pai soma +1 nesse número.
//  A lista recebe esse número por prop e recarrega quando ele muda.
//
//  Esse padrão tem nome: *lifting state up*. É a resposta para
//  "como faço um componente falar com outro?" — resposta: pelo pai.
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  removerProduto,
} from "../services/products";
import { Aviso, Esqueleto } from "./ui";

const FORMULARIO_VAZIO = {
  titulo: "",
  descricao: "",
  imagem: "",
  quantidade: "",
};

export default function Painel() {
  const [produtos, setProdutos] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const lista = await listarProdutos();
        if (!cancelado) setProdutos(lista);
      } catch (err) {
        if (!cancelado) setErro(err.message);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [versao]);

  const produtosVisiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return produtos;
    return produtos.filter((produto) =>
      `${produto.titulo} ${produto.descricao}`.toLocaleLowerCase("pt-BR").includes(termo)
    );
  }, [produtos, busca]);

  function mudarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  function prepararEdicao(produto) {
    setProdutoEditando(produto._id || produto.id);
    setFormulario({
      titulo: produto.titulo,
      descricao: produto.descricao,
      imagem: produto.imagem,
      quantidade: String(produto.quantidade),
    });
    setErro("");
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setProdutoEditando(null);
    setFormulario(FORMULARIO_VAZIO);
    setErro("");
    setMensagem("");
  }

  async function salvarProduto(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);

    const dados = { ...formulario, quantidade: Number(formulario.quantidade) };

    try {
      if (produtoEditando) {
        await atualizarProduto(produtoEditando, dados);
        setMensagem("Produto atualizado.");
      } else {
        await criarProduto(dados);
        setMensagem("Produto cadastrado.");
      }
      setFormulario(FORMULARIO_VAZIO);
      setProdutoEditando(null);
      setVersao((atual) => atual + 1);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto) {
    if (!window.confirm(`Excluir "${produto.titulo}" do catálogo?`)) return;

    const id = produto._id || produto.id;
    setExcluindo(id);
    setErro("");
    setMensagem("");
    try {
      await removerProduto(id);
      setProdutos((atuais) => atuais.filter((item) => (item._id || item.id) !== id));
      if (produtoEditando === id) cancelarEdicao();
      setMensagem("Produto removido.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div className="painel">
      <header className="cabecalho catalogo-cabecalho">
        <div className="marca">
          <span className="marca-ponto" />
          <div>
            <p className="marca-sobretitulo">INVENTÁRIO · MONGODB</p>
            <h1>Catálogo de produtos</h1>
            <p>{API_URL}</p>
          </div>
        </div>
        <div className="resumo-catalogo">
          <span className="resumo-numero">{produtos.length}</span>
          <span>produto(s) no catálogo</span>
        </div>
      </header>

      <main className="conteudo catalogo-layout">
        <section className="coluna-principal cartao">
          <div className="cartao-topo">
            <div>
              <h2>Produtos</h2>
              <p className="sub">
                {carregando ? "carregando do banco…" : `${produtosVisiveis.length} exibido(s)`}
              </p>
            </div>
            <button
              className="botao botao-fantasma"
              onClick={() => setVersao((atual) => atual + 1)}
              disabled={carregando}
            >
              ↻ Atualizar
            </button>
          </div>

          <input
            className="campo-input busca"
            type="search"
            placeholder="Buscar por título ou descrição..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            aria-label="Buscar produtos"
          />

          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {carregando && <Esqueleto quantidade={4} />}

          {!carregando && !erro && produtosVisiveis.length === 0 && (
            <div className="vazio">
              <span>▦</span>
              <p>{busca ? "Nenhum produto corresponde à busca." : "O catálogo ainda está vazio."}</p>
            </div>
          )}

          {!carregando && produtosVisiveis.length > 0 && (
            <div className="grade-produtos">
              {produtosVisiveis.map((produto) => {
                const id = produto._id || produto.id;
                return (
                  <article className="produto-card" key={id}>
                    <div className="produto-imagem">
                      <span aria-hidden="true">Sem imagem</span>
                      {produto.imagem && (
                        <img
                          src={produto.imagem}
                          alt={produto.titulo}
                          loading="lazy"
                          onError={(evento) => evento.currentTarget.remove()}
                        />
                      )}
                    </div>
                    <div className="produto-dados">
                      <div className="produto-titulo-linha">
                        <h3>{produto.titulo}</h3>
                        <span className="produto-quantidade">{produto.quantidade} un.</span>
                      </div>
                      <p>{produto.descricao}</p>
                      <div className="produto-acoes">
                        <button className="botao botao-fantasma" onClick={() => prepararEdicao(produto)}>
                          Editar
                        </button>
                        <button
                          className="botao botao-excluir"
                          onClick={() => excluirProduto(produto)}
                          disabled={excluindo === id}
                        >
                          {excluindo === id ? "Excluindo…" : "Excluir"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="coluna-lateral">
          <section className="cartao formulario-produto">
            <div className="cartao-topo">
              <div>
                <h2>{produtoEditando ? "Editar produto" : "Novo produto"}</h2>
                <p className="sub">Os dados serão salvos no MongoDB</p>
              </div>
              <span className={produtoEditando ? "selo selo-put" : "selo selo-post"}>
                {produtoEditando ? "PATCH" : "POST"}
              </span>
            </div>

            <form onSubmit={salvarProduto}>
              <label className="campo">
                <span className="campo-rotulo">Título</span>
                <input
                  className="campo-input"
                  name="titulo"
                  value={formulario.titulo}
                  onChange={mudarCampo}
                  placeholder="Ex.: Fone Bluetooth"
                  required
                />
              </label>
              <label className="campo">
                <span className="campo-rotulo">Descrição</span>
                <textarea
                  className="campo-input campo-textarea"
                  name="descricao"
                  value={formulario.descricao}
                  onChange={mudarCampo}
                  placeholder="Detalhes do produto"
                  rows={4}
                  required
                />
              </label>
              <label className="campo">
                <span className="campo-rotulo">Imagem (URL ou caminho)</span>
                <input
                  className="campo-input"
                  name="imagem"
                  value={formulario.imagem}
                  onChange={mudarCampo}
                  placeholder="https://..."
                  required
                />
              </label>
              <label className="campo">
                <span className="campo-rotulo">Quantidade</span>
                <input
                  className="campo-input"
                  name="quantidade"
                  type="number"
                  min="0"
                  step="1"
                  value={formulario.quantidade}
                  onChange={mudarCampo}
                  placeholder="0"
                  required
                />
              </label>

              {erro && <Aviso tipo="erro">{erro}</Aviso>}
              {mensagem && <Aviso tipo="ok">{mensagem}</Aviso>}

              <button className="botao botao-primario" type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : produtoEditando ? "Salvar alterações" : "Cadastrar produto"}
              </button>
              {produtoEditando && (
                <button className="botao botao-fantasma botao-cancelar" type="button" onClick={cancelarEdicao}>
                  Cancelar edição
                </button>
              )}
            </form>
          </section>
        </aside>
      </main>
    </div>
  );
}
