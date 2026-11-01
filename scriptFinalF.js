 // IDENTIFICAÇÃO DO ARMAZENAMENTO
    const CHAVE = "registrosTEA";

    // DATA E HORÁRIO AUTOMÁTICOS
    function preencherDataAtual() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        const hora = String(agora.getHours()).padStart(2, "0");
        const minuto = String(agora.getMinutes()).padStart(2, "0");

        document.getElementById("data").value = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }

    // CARREGAR REGISTROS
    function carregarRegistros() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE)) || [];
        } catch (erro) {
            alert("Não foi possível ler os registros salvos.");
            return [];
        }
    }

    // SALVAR REGISTRO
    document.getElementById("formRegistro").addEventListener("submit", function(event) {
        event.preventDefault();
        const campoData = document.getElementById("data");

        if (!campoData.value) {
            preencherDataAtual();
        }

        const registros = carregarRegistros();

        const novoRegistro = {
            id: Date.now(),
            data: campoData.value,
            gatilhos: Array.from(document.querySelectorAll('input[name="gatilho"]:checked')).map(item => item.value),
            sinais: Array.from(document.querySelectorAll('input[name="sinal"]:checked')).map(item => item.value),
            observacao: document.getElementById("observacao").value
        };

        registros.push(novoRegistro);

        try {
            localStorage.setItem(CHAVE, JSON.stringify(registros));
            alert("Registro salvo com sucesso!");
            this.reset();
            preencherDataAtual();
            mostrarRegistros();
        } catch (erro) {
            alert("Não foi possível salvar. Verifique o espaço disponível no navegador.");
        }
    });

    // MOSTRAR HISTÓRICO
    function mostrarRegistros(lista = carregarRegistros()) {
        const historico = document.getElementById("historico");
        historico.replaceChildren();

        if (lista.length === 0) {
            historico.textContent = "Nenhum registro encontrado.";
            return;
        }

        lista.sort((a, b) => b.data.localeCompare(a.data));

        lista.forEach(registro => {
            const card = document.createElement("div");
            card.className = "registro";

            const titulo = document.createElement("h3");
            const [data, horario] = registro.data.split("T");
            const [ano, mes, dia] = data.split("-");
            
            titulo.textContent = `Data: ${dia}/${mes}/${ano} às ${horario}`;
            titulo.style.marginTop = "0";

            const gatilhos = document.createElement("p");
            gatilhos.textContent = "Gatilhos: " + (registro.gatilhos.join(", ") || "Nenhum informado");

            const sinais = document.createElement("p");
            sinais.textContent = "Sinais: " + (registro.sinais.join(", ") || "Nenhum informado");

            const observacao = document.createElement("p");
            observacao.textContent = "Observações: " + (registro.observacao || "Nenhuma");

            const excluir = document.createElement("button");
            excluir.textContent = "Excluir registro";
            excluir.className = "excluir";
            excluir.addEventListener("click", function() {
                excluirRegistro(registro.id);
            });

            card.append(titulo, gatilhos, sinais, observacao, excluir);
            historico.appendChild(card);
        });
    }

    // CONSULTAR POR PERÍODO
    function filtrarRegistros() {
        const inicio = document.getElementById("inicio").value;
        const fim = document.getElementById("fim").value;

        if (inicio && fim && inicio > fim) {
            alert("A data inicial não pode ser maior que a data final.");
            return;
        }

        const registros = carregarRegistros();
        const filtrados = registros.filter(registro => {
            const dataRegistro = registro.data.substring(0, 10);
            return (!inicio || dataRegistro >= inicio) && (!fim || dataRegistro <= fim);
        });

        mostrarRegistros(filtrados);
    }

    // EXCLUIR REGISTRO
    function excluirRegistro(id) {
        const confirmar = confirm("Deseja realmente excluir este registro?");
        if (!confirmar) return;

        const registros = carregarRegistros().filter(registro => registro.id !== id);

        try {
            localStorage.setItem(CHAVE, JSON.stringify(registros));
            mostrarRegistros();
        } catch (erro) {
            alert("Não foi possível atualizar o histórico.");
        }
    }

    // BOTÕES DE CONSULTA
    document.getElementById("btnConsultar").addEventListener("click", filtrarRegistros);

    document.getElementById("btnTodos").addEventListener("click", function() {
        document.getElementById("inicio").value = "";
        document.getElementById("fim").value = "";
        mostrarRegistros();
    });

    // INICIALIZAR SISTEMA
    preencherDataAtual();
    mostrarRegistros();