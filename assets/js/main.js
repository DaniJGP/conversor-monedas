const MONEDA_URL = 'https://mindicador.cl/api';

const inputCLP = document.getElementById('inputCLP');
const selectMoneda = document.getElementById('selectMoneda');
const formConversor = document.getElementById('conversor');
const myChart = document.getElementById('myChart');
const divResultado = document.getElementById('resultado');
const divError = document.getElementById('error');

Chart.defaults.borderColor = '#fdf0d516';
Chart.defaults.color = '#eee';

let renderedChart = null;

async function getListaMonedas() {
    let ListaMonedas = [];
    try {
        const res = await fetch(MONEDA_URL);
        const monedas = await res.json();
        for (const moneda in monedas) {
            if (monedas[moneda].unidad_medida === 'Pesos') {
                let nuevaMoneda = {
                    codigo: monedas[moneda].codigo,
                    nombre: monedas[moneda].nombre,
                };
                ListaMonedas.push(nuevaMoneda);
            }
        }
        return ListaMonedas;
    } catch (err) {
        divError.innerHTML = `:( algo salió mal (${err.message})`;
    }
}

async function fillSelect() {
    let selectHTML = '';
    const listaMonedas = await getListaMonedas();
    for (moneda of listaMonedas) {
        selectHTML += `
            <option value="${moneda.codigo}">${moneda.nombre}</option>
        `;
    }
    selectMoneda.innerHTML = selectHTML;
}

async function getValores(codigo) {
    try {
        const res = await fetch(`${MONEDA_URL}/${codigo}`);
        const JSON = await res.json();
        let data = [];
        for (let i = 0; i < 10; i++) {
            data.push(JSON.serie[i]);
        }
        return data;
    } catch (err) {
        divError.innerHTML = `:( algo salió mal (${err.message})`;
    }
}

function renderConversion(clp, valor) {
    let resultado = Number(clp) / Number(valor);
    divResultado.textContent = `Resultado: $${resultado.toFixed(2)}`;
}

async function renderChart(data) {
    if (renderedChart) {
        renderedChart.destroy();
    }
    const fechas = data.map((moneda) => moneda.fecha.split('T')[0]);
    const valores = data.map((moneda) => moneda.valor);

    const chartConfig = {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [
                {
                    label: 'Valor en CLP',
                    data: valores,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    reverse: true,
                },
            },
        },
    };
    renderedChart = new Chart(myChart, chartConfig);
}

fillSelect();

formConversor.addEventListener('submit', async function (evt) {
    evt.preventDefault();
    const data = await getValores(selectMoneda.value);
    renderConversion(inputCLP.value, data[0].valor);
    renderChart(data);
});
